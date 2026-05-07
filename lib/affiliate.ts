import { AMAZON_TAG } from './config';

/**
 * Build the canonical Amazon URL with our affiliate tag.
 * Always points at the product page so the tag is honored.
 */
export function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}&linkCode=ll1&ref_=as_li_ss_tl`;
}

/**
 * iOS/Android deep link that opens the Amazon app directly when installed.
 * Used by the /go/[asin] redirect page; falls back to the web URL.
 */
export function amazonAppUrl(asin: string): string {
  return `amzn://detail/${asin}?tag=${AMAZON_TAG}`;
}

/**
 * Pick the best outbound URL for a card: prefer a stored short_link
 * (urlgenius/amzn.to), then affiliate_link, then the canonical /dp/{ASIN}.
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
