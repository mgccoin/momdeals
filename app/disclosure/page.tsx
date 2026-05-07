import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: `Affiliate disclosure for ${SITE_NAME}.`,
};

export default function DisclosurePage() {
  return (
    <article className="container-site max-w-prose py-14">
      <h1 className="font-display text-4xl font-black text-plum-800">Affiliate Disclosure</h1>
      <div className="prose-mom mt-6">
        <p>
          {SITE_NAME} is a participant in the Amazon Services LLC Associates Program, an
          affiliate advertising program designed to provide a means for sites to earn
          advertising fees by advertising and linking to Amazon.com.
        </p>
        <p>
          When you click a "Get this deal" button on this site and make a purchase on
          Amazon, we may earn a small commission — at no additional cost to you. This
          helps support the site and keeps the deal feed free.
        </p>
        <p>
          Prices, coupons, and availability shown were accurate at the time we last
          checked, but Amazon prices can change at any moment. Always verify the price
          on the product page before checking out.
        </p>
        <p>
          We only feature products we believe a real mom would actually find useful.
          We never accept payment in exchange for editorial coverage.
        </p>
      </div>
    </article>
  );
}
