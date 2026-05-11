import { AMAZON_TAG } from './config';

// Amazon.com's own seller ID — pins the link to Amazon-fulfilled stock and
// matches the URL pattern Amazon's iOS apple-app-site-association is keyed
// off of (so Universal Links can open the Amazon app reliably).
const AMAZON_SELLER_ID = 'ATVPDKIKX0DER';

/**
 * Build the canonical Amazon affiliate URL using Amazon's official SiteStripe
 * "Onsite Get-It" (`ogi`) parameter set — the same format DansDeals ships.
 * iOS Safari opens the Amazon app via Universal Links on tap when installed;
 * Android Chrome opens it via Android App Links.
 */
export function amazonUrl(asin: string): string {
  return (
    `https://www.amazon.com/dp/${asin}` +
    `?tag=${AMAZON_TAG}` +
    `&linkCode=ogi` +
    `&th=1` +
    `&psc=1` +
    `&smid=${AMAZON_SELLER_ID}`
  );
}

/**
 * Custom-scheme deep link that opens the Amazon Shopping app directly.
 * Works on iOS / Android when the app is installed. Used as a hard
 * fallback inside the in-app landing page.
 */
export function amazonAppUrl(asin: string): string {
  return `amzn://detail/${asin}?tag=${AMAZON_TAG}`;
}

/**
 * Android intent URL that:
 *   1. Opens the Amazon Shopping app via package
 *      `com.amazon.mShop.android.shopping` if installed.
 *   2. Otherwise falls back automatically to `fallbackUrl`
 *      (the affiliate web URL) — Chrome handles this natively
 *      via `S.browser_fallback_url`.
 *
 * The resolved deep link is `amzn://detail/{ASIN}?tag={TAG}`,
 * so the affiliate tag is preserved either way.
 */
export function amazonAndroidIntent(asin: string, fallbackUrl: string): string {
  return (
    `intent://detail/${asin}?tag=${AMAZON_TAG}` +
    `#Intent;scheme=amzn;package=com.amazon.mShop.android.shopping;` +
    `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
  );
}

/**
 * Pick the best outbound URL for a card: prefer a stored short_link
 * (urlgenius/amzn.to), then affiliate_link, then the canonical /dp/{ASIN}.
 *
 * URLgenius links handle their own iOS / Android deep linking server-side,
 * so when one is available we trust it end-to-end (this also preserves
 * URLgenius click tracking).
 */
export function bestOutboundUrl(opts: {
  asin?: string | null;
  short_link?: string | null;
  affiliate_link?: string | null;
}): string {
  if (opts.short_link && opts.short_link.startsWith('http')) return opts.short_link;
  if (opts.affiliate_link && opts.affiliate_link.startsWith('http')) return opts.affiliate_link;
  if (opts.asin) return amazonUrl(opts.asin);
  return 'https://www.amazon.com/';
}
