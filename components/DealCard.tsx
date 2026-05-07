import Image from 'next/image';
import Link from 'next/link';
import type { FeedItem } from '@/lib/types';
import { formatDate, timeAgo, safeTags } from '@/lib/format';
import { DealBadges } from './DealBadge';
import { PriceTag } from './PriceTag';

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23F4EFF6"/><text x="300" y="320" font-size="60" font-family="serif" text-anchor="middle" fill="%23A684B8">MomDeals</text></svg>';

export function DealCard({
  item,
  layout = 'row',
}: {
  item: FeedItem;
  layout?: 'row' | 'tile' | 'feature';
}) {
  const img = item.ap_image || item.image_url || FALLBACK_IMG;
  const asin = item.product_asin || item.ap_asin || '';
  const tags = safeTags(item.tags).slice(0, 3);

  const postHref = `/post/${item.id}`;
  const dealHref = asin ? `/go/${asin}` : null;

  const PriceBlock = (
    <PriceTag price={item.ap_price ?? item.product_price} listPrice={item.ap_list_price} size={layout === 'feature' ? 'lg' : 'md'} />
  );

  const Badges = (
    <DealBadges
      hasDeal={item.ap_has_deal}
      hasCoupon={item.ap_has_coupon}
      dealScore={item.ap_deal_score}
      dealText={item.ap_deal_text}
      couponText={item.ap_coupon_text}
    />
  );

  // ── Feature layout (large hero card on home page)
  if (layout === 'feature') {
    return (
      <article className="group overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-card transition hover:shadow-cardHover">
        <Link href={postHref} className="relative block aspect-[16/9] w-full overflow-hidden">
          <Image
            src={img}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            unoptimized={img.startsWith('data:')}
          />
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">{Badges}</div>
        </Link>
        <div className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-plum-400">
              <time>{formatDate(item.created_at)}</time> · <span>{timeAgo(item.created_at)}</span>
            </div>
            <Link href={postHref} className="mt-2 block">
              <h2 className="font-display text-2xl font-bold leading-snug text-plum-800 group-hover:text-coral-600 md:text-3xl">
                {item.title}
              </h2>
            </Link>
            <p className="mt-3 line-clamp-3 text-plum-600">{item.excerpt}</p>
          </div>
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            {PriceBlock}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={postHref} className="btn-ghost">Quick view</Link>
              {dealHref && (
                <a href={dealHref} className="btn-coral" rel="nofollow sponsored noopener">
                  Get this deal
                  <Arrow />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ── Tile layout (products grid)
  if (layout === 'tile') {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-plum-100 bg-white shadow-card transition hover:shadow-cardHover">
        <Link href={postHref} className="relative block aspect-square w-full overflow-hidden bg-plum-50">
          <Image
            src={img}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
            unoptimized={img.startsWith('data:')}
          />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">{Badges}</div>
        </Link>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <Link href={postHref} className="font-display text-base font-bold leading-snug text-plum-800 group-hover:text-coral-600 line-clamp-3">
            {item.title}
          </Link>
          <div className="mt-auto space-y-2.5">
            {PriceBlock}
            {dealHref && (
              <a href={dealHref} className="btn-coral w-full text-sm" rel="nofollow sponsored noopener">
                Get this deal
                <Arrow />
              </a>
            )}
          </div>
        </div>
      </article>
    );
  }

  // ── Default: DansDeals-style row
  return (
    <article className="group grid grid-cols-[112px_1fr] gap-4 overflow-hidden rounded-2xl border border-plum-100 bg-white p-3 shadow-card transition hover:shadow-cardHover sm:grid-cols-[200px_1fr] sm:p-4">
      <Link href={postHref} className="relative block aspect-square w-full overflow-hidden rounded-xl bg-plum-50">
        <Image
          src={img}
          alt={item.title}
          fill
          sizes="(min-width: 640px) 200px, 112px"
          className="object-contain p-2 transition duration-500 group-hover:scale-[1.04] sm:p-4"
          unoptimized={img.startsWith('data:')}
        />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-plum-400">
          {Badges}
          <span>{timeAgo(item.created_at)}</span>
        </div>
        <Link href={postHref} className="mt-1.5 block">
          <h3 className="font-display text-lg font-bold leading-snug text-plum-800 group-hover:text-coral-600 sm:text-xl">
            {item.title}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm text-plum-600 sm:line-clamp-3">{item.excerpt}</p>

        {tags.length > 0 && (
          <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
            {tags.map((t, i) => (
              <span key={i} className="rounded-full border border-plum-100 bg-plum-50/60 px-2.5 py-0.5 text-[11px] text-plum-500">
                #{t.replace(/^#/, '')}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">{PriceBlock}</div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={postHref} className="btn-ghost px-4 py-2 text-xs sm:text-sm">Quick view</Link>
            {dealHref && (
              <a href={dealHref} className="btn-coral px-4 py-2 text-xs sm:text-sm" rel="nofollow sponsored noopener">
                Get this deal
                <Arrow />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
