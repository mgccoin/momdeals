import type { ReactNode } from 'react';

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || 'momsdeals07-20';

// Amazon.com's own seller ID — pins the link to Amazon-fulfilled stock and
// matches the URL pattern Amazon's iOS apple-app-site-association is keyed
// off of (which is what makes Universal Links open the Amazon Shopping app).
const AMAZON_SELLER_ID = 'ATVPDKIKX0DER';

/**
 * Build the canonical Amazon affiliate URL using Amazon's official SiteStripe
 * "Onsite Get-It" (`ogi`) parameter set — the same format DansDeals and other
 * major affiliate sites ship.
 *
 *   tag         = our affiliate tag (momsdeals07-20)
 *   linkCode    = ogi → SiteStripe Onsite Get-It Image link code
 *   th=1, psc=1 = product/variation indicators (helps attribution)
 *   smid        = seller marketplace ID, pinned to Amazon.com itself
 */
function amazonAffiliateUrl(asin: string): string {
  return (
    `https://www.amazon.com/dp/${asin}` +
    `?tag=${TAG}` +
    `&linkCode=ogi` +
    `&th=1` +
    `&psc=1` +
    `&smid=${AMAZON_SELLER_ID}`
  );
}

type Props = {
  asin: string;
  /** Unused — kept for API compatibility. */
  shortLink?: string | null;
  /** Unused — kept for API compatibility. */
  affiliateLink?: string | null;
  className?: string;
  children: ReactNode;
};

/**
 * "Get this deal" / "Get it on Amazon" button.
 *
 * Pure server component, zero client JS. Renders a plain anchor in the same
 * shape as DansDeals' "Get This Deal" buttons, which is the most reliable
 * way to trigger the Amazon Shopping app handoff on every platform:
 *
 *   • iOS Safari            → Apple Universal Link opens the Amazon app
 *                             when installed; otherwise opens amazon.com.
 *   • Android Chrome/Edge   → Android App Link opens the Amazon app when
 *                             installed; otherwise opens amazon.com.
 *   • iOS / Android in-app  → loads amazon.com inside the in-app webview;
 *     browsers (FB/IG/etc)    Amazon's own page renders the "Open in App"
 *                             smart banner.
 *   • Desktop               → opens amazon.com in a new tab.
 *
 * No popups, no scheme errors, no JS quirks — just like DansDeals.
 */
export function DealLink({
  asin,
  className,
  children,
}: Props) {
  const href = amazonAffiliateUrl(asin);
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
