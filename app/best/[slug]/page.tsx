import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdDisclosure } from '@/components/AdDisclosure';
import { DealBadges } from '@/components/DealBadge';
import { DealLink } from '@/components/DealLink';
import { PriceTag } from '@/components/PriceTag';
import { SocialProof } from '@/components/StarRating';
import { fetchRoundup } from '@/lib/api';
import { REVALIDATE_SECONDS, SITE_NAME, SITE_URL } from '@/lib/config';
import { discountPercent, formatPrice, parsePrice } from '@/lib/format';
import {
  ROUNDUPS,
  getRoundup,
  roundupDescription,
  roundupHeading,
  roundupTitle,
} from '@/lib/roundups';

export const revalidate = REVALIDATE_SECONDS;

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23F4EFF6"/><text x="300" y="320" font-size="60" font-family="serif" text-anchor="middle" fill="%23A684B8">MomDeals</text></svg>';

export function generateStaticParams() {
  return ROUNDUPS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const r = getRoundup(params.slug);
  if (!r) return { title: 'Guide not found' };
  const title = roundupTitle(r);
  const description = roundupDescription(r);
  return {
    title,
    description,
    alternates: { canonical: `/best/${r.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/best/${r.slug}`,
      siteName: SITE_NAME,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function rankLabel(n: number): string {
  if (n === 1) return 'Top Pick';
  if (n === 2) return 'Runner-up';
  if (n === 3) return 'Great Value';
  return `#${n}`;
}

export default async function RoundupPage({ params }: { params: { slug: string } }) {
  const r = getRoundup(params.slug);
  if (!r) notFound();

  const { products: items } = await fetchRoundup({
    keywords: r.keywords,
    exclude: r.exclude,
    limit: r.count,
  });

  const year = new Date().getFullYear();
  const heading = roundupHeading(r, year);

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: heading,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => {
      const priceNum = parsePrice(p.price);
      const product: Record<string, unknown> = {
        '@type': 'Product',
        name: p.title,
        image: p.image_url ? [p.image_url] : undefined,
        sku: p.asin,
        url: `${SITE_URL}/product/${p.asin}`,
        brand: { '@type': 'Brand', name: 'Amazon' },
      };
      if (priceNum) {
        product.offers = {
          '@type': 'Offer',
          url: `${SITE_URL}/go/${p.asin}`,
          priceCurrency: 'USD',
          price: priceNum.toFixed(2),
          availability: 'https://schema.org/InStock',
        };
      }
      if (p.rating > 0 && p.review_count > 0) {
        product.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: p.rating.toFixed(1),
          reviewCount: p.review_count,
          bestRating: '5',
          worstRating: '1',
        };
      }
      return { '@type': 'ListItem', position: i + 1, item: product };
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Best Of', item: `${SITE_URL}/best` },
      { '@type': 'ListItem', position: 3, name: heading, item: `${SITE_URL}/best/${r.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="container-site py-12">
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-plum-500">
          <Link href="/best" className="hover:text-coral-600">Best Of</Link>
          <span>/</span>
          <span className="text-plum-700">{r.noun}</span>
        </nav>

        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-black text-plum-800 md:text-5xl">{heading}</h1>
          <p className="mt-3 text-plum-600">{r.intro}</p>
          <AdDisclosure variant="full" className="mt-4" />
        </header>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-plum-200 bg-white/60 px-8 py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-plum-800">
              Fresh {r.noun.toLowerCase()} picks landing soon
            </h2>
            <p className="mt-2 text-plum-500">
              Browse <Link href="/products" className="font-semibold text-coral-600 hover:underline">all of today’s deals</Link> in the meantime.
            </p>
          </div>
        ) : (
          <ol className="mt-10 space-y-6">
            {items.map((p, i) => {
              const img = p.image_url || FALLBACK_IMG;
              const off = discountPercent(p.price, p.list_price);
              const price = formatPrice(p.price);
              return (
                <li
                  key={p.asin}
                  className="relative grid gap-5 rounded-3xl border border-plum-100 bg-white p-5 shadow-card sm:grid-cols-[auto_minmax(0,1fr)] md:p-6"
                >
                  <div className="flex flex-row gap-4 sm:flex-col sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-coral-500 font-display text-xl font-black text-white shadow-card">
                      {i + 1}
                    </div>
                    <Link
                      href={`/product/${p.asin}`}
                      className="relative block aspect-square w-28 shrink-0 overflow-hidden rounded-2xl border border-plum-100 bg-plum-50 sm:w-40"
                    >
                      <Image
                        src={img}
                        alt={p.title}
                        fill
                        sizes="160px"
                        className="object-contain p-2"
                        priority={i === 0}
                        unoptimized={img.startsWith('data:')}
                      />
                    </Link>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sage-700">
                        {rankLabel(i + 1)}
                      </span>
                      <DealBadges
                        hasDeal={p.has_deal}
                        hasCoupon={p.has_coupon}
                        dealScore={p.deal_score}
                        dealText={p.deal_text}
                        couponText={p.coupon_text}
                      />
                    </div>

                    <h2 className="mt-2 font-display text-lg font-bold leading-snug text-plum-800 md:text-xl">
                      <Link href={`/product/${p.asin}`} className="hover:text-coral-600">
                        {p.title}
                      </Link>
                    </h2>

                    <SocialProof rating={p.rating} reviewCount={p.review_count} className="mt-2" />

                    <div className="mt-3">
                      <PriceTag price={p.price} listPrice={p.list_price} />
                    </div>

                    {p.coupon_text && (
                      <p className="mt-2 text-sm text-sage-700">
                        <strong className="font-semibold">Coupon:</strong> {p.coupon_text}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <DealLink
                        asin={p.asin}
                        shortLink={p.short_link}
                        affiliateLink={p.affiliate_link}
                        className="btn-coral px-6 py-3 text-sm"
                      >
                        {off != null && off >= 5 ? `Get it — ${off}% off` : `Check price${price ? ` (${price})` : ''}`}
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </DealLink>
                      <Link href={`/product/${p.asin}`} className="text-sm font-semibold text-plum-500 hover:text-coral-600">
                        Details
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <section className="mt-12 rounded-3xl border border-plum-100 bg-white/60 p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-plum-800">
            How we pick the best {r.noun.toLowerCase()}
          </h2>
          <p className="mt-3 text-plum-600">
            This list is generated from live Amazon pricing and refreshed daily. We rank {r.noun.toLowerCase()} by
            current deal strength (discount depth, active coupons, and limited-time promos) combined with the
            number of verified Amazon reviews, so the picks above reflect what’s actually a great buy right now —
            not last month. Prices and availability change fast; tap through to confirm the current price on Amazon.
          </p>
        </section>

        <p className="mt-8 text-xs text-plum-400">
          As an Amazon Associate {SITE_NAME} earns from qualifying purchases. Prices and availability are accurate
          as of the date/time shown and are subject to change.
        </p>
      </article>
    </>
  );
}
