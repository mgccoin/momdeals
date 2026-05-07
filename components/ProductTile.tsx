import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { DealBadges } from './DealBadge';
import { PriceTag } from './PriceTag';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23F4EFF6"/><text x="300" y="320" font-size="60" font-family="serif" text-anchor="middle" fill="%23A684B8">MomDeals</text></svg>';

export function ProductTile({ product }: { product: Product }) {
  const img = product.image_url || FALLBACK_IMG;
  const detailHref = `/product/${product.asin}`;
  const dealHref   = product.asin ? `/go/${product.asin}` : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-card transition hover:shadow-cardHover">
      <Link href={detailHref} className="relative block aspect-square w-full overflow-hidden bg-plum-50">
        <Image
          src={img}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
          unoptimized={img.startsWith('data:')}
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <DealBadges
            hasDeal={product.has_deal}
            hasCoupon={product.has_coupon}
            dealScore={product.deal_score}
            dealText={product.deal_text}
            couponText={product.coupon_text}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={detailHref}
          className="font-display text-base font-bold leading-snug text-plum-800 group-hover:text-coral-600 line-clamp-3"
        >
          {product.title}
        </Link>
        <div className="mt-auto space-y-2.5">
          <PriceTag price={product.price} listPrice={product.list_price} />
          {dealHref && (
            <a href={dealHref} className="btn-coral w-full text-sm" rel="nofollow sponsored noopener">
              Get this deal
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
