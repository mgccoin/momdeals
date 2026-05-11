import type { NextRequest } from 'next/server';
import { fetchProduct } from '@/lib/api';
import {
  amazonAndroidIntent,
  amazonAppUrl,
  amazonUrl,
  bestOutboundUrl,
} from '@/lib/affiliate';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

/**
 * /go/[asin]
 * ───────────
 * Smart-link redirect that powers every "Get this deal" /
 * "Get it on Amazon" button on the site.
 *
 *  • Android (any browser) → `intent://...amzn://detail/{ASIN}?tag=...`
 *      Chrome / Samsung / Edge launch the Amazon Shopping app via
 *      package `com.amazon.mShop.android.shopping`. If the app isn't
 *      installed the intent transparently falls back to the affiliate
 *      web URL (`S.browser_fallback_url`).
 *
 *  • iOS Safari (real Safari, not in-app) → amazon.com URL.
 *      Apple's Universal Links open the Amazon Shopping app whenever
 *      it's installed; otherwise the user lands on amazon.com with
 *      the affiliate tag attached.
 *
 *  • iOS in-app browsers (Facebook / Instagram / TikTok / Pinterest)
 *      → amazon.com URL. Amazon's own site shows its native
 *      "Open in App" banner — JS-launched custom schemes are blocked
 *      inside in-app browsers, so this is the most reliable handoff.
 *
 *  • Desktop → amazon.com (no native app to open).
 *
 * Every outbound URL carries the `momsdeals07-20` tag.
 *
 * If a stored short link exists (e.g. URLgenius), we trust it
 * end-to-end since URLgenius does its own platform-specific deep
 * linking AND tracks clicks for us.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { asin: string } },
) {
  const asin = (params?.asin || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return new Response('Invalid ASIN', { status: 400 });
  }

  // Look up stored short / affiliate link, if any.
  const product = await fetchProduct(asin).catch(() => null);
  const storedShort =
    product?.short_link && product.short_link.startsWith('http')
      ? product.short_link
      : null;

  const webUrl = bestOutboundUrl({
    asin,
    short_link: product?.short_link,
    affiliate_link: product?.affiliate_link,
  });

  const ua = request.headers.get('user-agent') || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isInApp =
    /FBAN|FBAV|FB_IAB|FB4A|FBDV|Instagram|musical_ly|TikTok|Pinterest|Snapchat|LinkedInApp/i.test(
      ua,
    );

  const headers: Record<string, string> = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Referrer-Policy': 'no-referrer-when-downgrade',
  };

  // 1. URLgenius / amzn.to short link present → trust it (handles its own
  //    deep linking + click tracking on every platform).
  if (storedShort) {
    headers.Location = storedShort;
    return new Response(null, { status: 302, headers });
  }

  // 2. Android (any browser) → intent URL opens the Amazon app.
  if (isAndroid) {
    headers.Location = amazonAndroidIntent(asin, webUrl);
    return new Response(null, { status: 302, headers });
  }

  // 3. iOS Safari → amazon.com (Universal Link auto-opens app).
  //    iOS in-app browsers → amazon.com (native "Open in App" banner).
  //    Desktop → amazon.com.
  if (isIOS) {
    // For real Safari we render a tiny HTML shim that fires the
    // amzn:// scheme on the first user-eligible tick. This is a
    // belt-and-braces nudge in case Universal Links don't auto-trigger
    // from a server-side redirect (iOS 14+ can be inconsistent).
    if (!isInApp) {
      const html = iosLaunchHtml(asin, webUrl);
      return new Response(html, {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    headers.Location = webUrl;
    return new Response(null, { status: 302, headers });
  }

  // 4. Desktop / unknown → straight to the affiliate web URL.
  headers.Location = webUrl;
  return new Response(null, { status: 302, headers });
}

/**
 * Tiny iOS Safari launcher. Tries the Amazon app deep link first
 * (Universal Link / amzn://) and falls back to the affiliate web URL
 * if the app doesn't grab focus within ~1.2s. Page is `noindex`.
 */
function iosLaunchHtml(asin: string, webUrl: string): string {
  const appUrl = amazonAppUrl(asin);
  const safeApp = JSON.stringify(appUrl);
  const safeWeb = JSON.stringify(webUrl);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <meta property="al:ios:url" content="${appUrl}" />
  <meta property="al:ios:app_store_id" content="297606951" />
  <meta property="al:ios:app_name" content="Amazon" />
  <meta property="al:web:url" content="${webUrl}" />
  <title>Opening Amazon\u2026</title>
  <style>
    html,body{margin:0;background:#FBF7F2;color:#3F2A4D;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      min-height:100%;display:flex;align-items:center;justify-content:center;text-align:center}
    .wrap{padding:24px}
    .dot{width:14px;height:14px;border-radius:50%;background:#F47C5D;display:inline-block;
      margin:0 4px;animation:b 1s infinite ease-in-out}
    .dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
    @keyframes b{0%,80%,100%{transform:scale(.5);opacity:.4}40%{transform:scale(1);opacity:1}}
    a{color:#F47C5D;font-weight:600;text-decoration:none}
    p{margin:14px 0 0;font-size:14px}
  </style>
</head>
<body>
  <div class="wrap">
    <div><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    <p>Opening Amazon\u2026</p>
    <p style="margin-top:18px"><a id="manual" href="${webUrl}" rel="nofollow sponsored noopener">Tap here if it doesn't open</a></p>
  </div>
  <script>
  (function(){
    var app = ${safeApp};
    var web = ${safeWeb};
    var done = false;
    function go(u){ try { window.location.replace(u); } catch(e){ window.location.href = u; } }
    function onHide(){ done = true; }
    document.addEventListener('visibilitychange', function(){ if (document.hidden) onHide(); });
    window.addEventListener('pagehide', onHide);
    window.addEventListener('blur', onHide);
    setTimeout(function(){ go(app); }, 0);
    setTimeout(function(){ if (!done && !document.hidden) go(web); }, 1200);
    var manual = document.getElementById('manual');
    if (manual) manual.addEventListener('click', function(){ done = true; });
  })();
  </script>
</body>
</html>`;
}
