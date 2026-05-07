import type { Metadata } from 'next';
import { fetchProduct } from '@/lib/api';
import { amazonAppUrl, amazonUrl, bestOutboundUrl } from '@/lib/affiliate';
import { SITE_NAME } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Opening Amazon…',
  robots: { index: false, follow: false },
};

/**
 * Mirrors the existing Express /go/:asin behavior:
 * - Tries to open the Amazon mobile app first (amzn://detail/{ASIN})
 * - Falls back to the canonical web URL after 1.5s if the app isn't installed
 * - Uses the saved short_link / affiliate_link if available
 */
export default async function GoPage({ params }: { params: { asin: string } }) {
  const asin = params.asin;

  // Look up stored short/affiliate link if we have one for this ASIN
  let webUrl = amazonUrl(asin);
  const product = await fetchProduct(asin).catch(() => null);
  if (product) {
    webUrl = bestOutboundUrl({
      asin,
      short_link: product.short_link,
      affiliate_link: product.affiliate_link,
    });
  }
  const appUrl = amazonAppUrl(asin);

  return (
    <div className="grid min-h-[80vh] place-items-center px-6 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-coral-500 text-white shadow-card">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="18" cy="21" r="1.5" />
            <path d="M3 3h2l3.4 13.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L22 8H6" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-3xl font-black text-plum-800">Opening Amazon…</h1>
        <p className="mt-2 text-plum-500">If the app doesn't open automatically:</p>
        <a
          href={webUrl}
          rel="nofollow sponsored noopener"
          className="btn-coral mt-5 px-6 py-3 text-base"
        >
          Tap here to continue →
        </a>
        <p className="mt-6 text-xs text-plum-400">
          As an Amazon Associate {SITE_NAME} earns from qualifying purchases.
        </p>

        <noscript>
          <meta httpEquiv="refresh" content={`0; url=${webUrl}`} />
        </noscript>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try { window.location.replace(${JSON.stringify(appUrl)}); } catch (e) {}
                setTimeout(function() {
                  window.location.replace(${JSON.stringify(webUrl)});
                }, 1500);
              })();
            `,
          }}
        />
      </div>
    </div>
  );
}
