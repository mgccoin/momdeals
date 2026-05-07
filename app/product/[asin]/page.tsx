import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DealBadges } from '@/components/DealBadge';
import { PriceTag } from '@/components/PriceTag';
import { fetchProduct } from '@/lib/api';
import { REVALIDATE_SECONDS, SITE_URL, SITE_NAME } from '@/lib/config';
import { discountPercent, formatDate, formatPrice, parsePrice } from '@/lib/format';

export const revalidate = REVALIDATE_SECONDS;

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23F4EFF6"/><text x="300" y="320" font-size="60" font-family="serif" text-anchor="middle" fill="%23A684B8">MomDeals</text></svg>';

export async function generateMetadata({
  params,
}: {
  params: { asin: string };
}): Promise<Metadata> {
  const product = await fetchProduct(params.asin);
  if (!product) return { title: 'Product not found' };
  const price = formatPrice(product.price);
  return {
    title: product.title,
    description:
      `${product.title}${price ? ` — currently ${price}` : ''}. Hand-picked Amazon deal on ${SITE_NAME}.`,
    openGraph: {
      title: product.title,
      description: price ? `Now ${price} on Amazon` : 'Hand-picked Amazon deal',
      images: product.image_url ? [product.image_url] : [],
      url: `${SITE_URL}/product/${params.asin}`,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: { asin: string } }) {
  const product = await fetchProduct(params.asin);
  if (!product) notFound();

  const img = product.image_url || FALLBACK_IMG;
  const dealHref = `/go/${product.asin}`;
  const post = product.post;
  const off = discountPercent(product.price, product.list_price);
  const priceNum = parsePrice(product.price);

  // JSON-LD Product schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url ? [product.image_url] : undefined,
    sku: product.asin,
    brand: { '@type': 'Brand', name: 'Amazon' },
    offers: priceNum
      ? {
          '@type': 'Offer',
          url: `${SITE_URL}/go/${product.asin}`,
          priceCurrency: 'USD',
          price: priceNum.toFixed(2),
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'Amazon.com' },
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <article className="container-site py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-plum-500">
          <Link href="/products" className="hover:text-coral-600">All products</Link>
          <span>/</span>
          <span className="line-clamp-1 text-plum-700">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[5fr_4fr]">
          <div className="relative overflow-hidden rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
            <div className="relative mx-auto aspect-square w-full max-w-lg">
              <Image
                src={img}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 540px, 90vw"
                className="object-contain"
                priority
                unoptimized={img.startsWith('data:')}
              />
            </div>
            {off != null && off >= 5 && (
              <div className="absolute right-5 top-5 rounded-full bg-coral-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-card">
                {off}% off
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <DealBadges
              hasDeal={product.has_deal}
              hasCoupon={product.has_coupon}
              dealScore={product.deal_score}
              dealText={product.deal_text}
              couponText={product.coupon_text}
            />
            <h1 className="mt-3 font-display text-3xl font-black leading-tight text-plum-800 md:text-4xl">
              {product.title}
            </h1>

            <div className="mt-5">
              <PriceTag price={product.price} listPrice={product.list_price} size="lg" />
            </div>

            {product.coupon_text && (
              <div className="mt-4 inline-flex items-start gap-2 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
                <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
                  <path d="M9 12h6" />
                </svg>
                <span><strong className="font-semibold">Coupon:</strong> {product.coupon_text}</span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={dealHref}
                className="btn-coral px-7 py-3.5 text-base"
                rel="nofollow sponsored noopener"
              >
                Get this deal on Amazon
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
              <span className="text-xs text-plum-400">
                Affiliate link · price last seen {formatDate(product.updated_at)}
              </span>
            </div>

            {product.review_count > 0 && (
              <p className="mt-4 text-sm text-plum-500">
                <strong className="text-plum-700">{product.review_count.toLocaleString()}</strong>{' '}
                Amazon reviews
              </p>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-plum-100 bg-white/60 p-5 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-plum-400">ASIN</dt>
                <dd className="mt-0.5 font-mono text-plum-700">{product.asin}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-plum-400">Tracked since</dt>
                <dd className="mt-0.5 text-plum-700">{formatDate(product.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {post && (
          <section className="mt-14 rounded-3xl border border-plum-100 bg-white p-6 shadow-card md:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-coral-500">Related read</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-plum-800 md:text-3xl">
              {post.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-plum-600">{post.excerpt}</p>
            <Link href={`/post/${post.id}`} className="btn-ghost mt-5">
              Read the full review
            </Link>
          </section>
        )}

        <p className="mt-10 text-xs text-plum-400">
          As an Amazon Associate {SITE_NAME} earns from qualifying purchases.
        </p>
      </article>
    </>
  );
}
