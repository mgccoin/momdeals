import { NextRequest, NextResponse } from 'next/server';
import { fetchProduct } from '@/lib/api';
import { amazonAppUrl, amazonUrl } from '@/lib/affiliate';
import { SITE_URL } from '@/lib/config';
import { extractAsin, isAmazonShortLink, withScheme } from '@/lib/deeplink';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_URLS = 25;
const MAX_HOPS = 6;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function authed(key: string | null | undefined): boolean {
  const expected = (process.env.ADMIN_KEY || '').trim();
  return Boolean(expected) && (key || '').trim() === expected;
}

export type LinkResult = {
  input: string;
  asin: string | null;
  /** Set when an amzn.to / a.co link was expanded to a full amazon.com URL. */
  resolvedUrl: string | null;
  /** The site's own smart link — opens the Amazon app on phones, tagged. */
  deepLink: string | null;
  /** Canonical amazon.com affiliate URL (SiteStripe "ogi" format). */
  affiliateUrl: string | null;
  /** amzn:// custom-scheme link (opens the app directly when installed). */
  appUrl: string | null;
  /** Cached URLgenius link, if this product already has one. */
  urlgeniusLink: string | null;
  title: string | null;
  image_url: string | null;
  /** Whether the product exists in the MomDeals catalog. */
  inCatalog: boolean;
  error: string | null;
};

/**
 * Follow amzn.to / a.co redirects hop-by-hop WITHOUT downloading the final
 * product page. Stops as soon as we land on a non-short-link host.
 */
async function resolveShortLink(url: string): Promise<string> {
  let current = withScheme(url);
  for (let i = 0; i < MAX_HOPS; i++) {
    let res: Response;
    try {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
        cache: 'no-store',
      });
    } catch {
      return current;
    }
    // We never need the body — release the connection.
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      try {
        current = new URL(loc, current).toString();
      } catch {
        return current;
      }
      if (!isAmazonShortLink(current)) return current;
      continue;
    }
    return current;
  }
  return current;
}

async function buildOne(input: string): Promise<LinkResult> {
  const base: LinkResult = {
    input,
    asin: null,
    resolvedUrl: null,
    deepLink: null,
    affiliateUrl: null,
    appUrl: null,
    urlgeniusLink: null,
    title: null,
    image_url: null,
    inCatalog: false,
    error: null,
  };

  const trimmed = input.trim();
  if (!trimmed) return { ...base, error: 'Empty line' };

  let resolved = trimmed;
  if (isAmazonShortLink(trimmed)) {
    resolved = await resolveShortLink(trimmed);
  }
  const resolvedUrl = resolved !== trimmed ? resolved : null;

  const asin = extractAsin(resolved);
  if (!asin) {
    return {
      ...base,
      resolvedUrl,
      error: resolvedUrl
        ? 'Short link expanded, but no ASIN was found at the destination.'
        : 'Could not find an Amazon ASIN in this link.',
    };
  }

  const product = await fetchProduct(asin).catch(() => null);
  const ug =
    product?.short_link && /^https?:\/\//i.test(product.short_link) ? product.short_link : null;
  const siteBase = SITE_URL.replace(/\/$/, '');

  return {
    ...base,
    asin,
    resolvedUrl,
    deepLink: `${siteBase}/go/${asin}`,
    affiliateUrl: amazonUrl(asin),
    appUrl: amazonAppUrl(asin),
    urlgeniusLink: ug,
    title: product?.title ?? null,
    image_url: product?.image_url ?? null,
    inCatalog: Boolean(product),
  };
}

// POST /api/admin/deeplink   body: { key, urls: string[] }  (or { key, url: "one\nper\nline" })
export async function POST(req: NextRequest) {
  let body: { key?: string; urls?: unknown; url?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const key = body.key ?? req.nextUrl.searchParams.get('key');
  if (!authed(key)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let list: string[] = [];
  if (Array.isArray(body.urls)) list = body.urls.map((u) => String(u ?? ''));
  else if (typeof body.url === 'string') list = body.url.split(/\r?\n/);
  list = list.map((s) => s.trim()).filter(Boolean);

  if (list.length === 0) {
    return NextResponse.json({ error: 'Paste at least one Amazon link.' }, { status: 400 });
  }
  if (list.length > MAX_URLS) {
    return NextResponse.json({ error: `Max ${MAX_URLS} links per batch.` }, { status: 400 });
  }

  const results = await Promise.all(list.map(buildOne));
  return NextResponse.json({ results, generated_at: new Date().toISOString() });
}
