import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdDisclosure } from '@/components/AdDisclosure';
import { DealBadges } from '@/components/DealBadge';
import { DealLink } from '@/components/DealLink';
import { PriceTag } from '@/components/PriceTag';
import { fetchPost } from '@/lib/api';
import { REVALIDATE_SECONDS, SITE_NAME, SITE_URL } from '@/lib/config';
import { formatDate, safeTags } from '@/lib/format';

export const revalidate = REVALIDATE_SECONDS;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await fetchPost(params.id);
  if (!post) return { title: 'Post not found' };

  const description =
    post.excerpt || `${post.title} — read the full review on ${SITE_NAME}.`;
  const url = `${SITE_URL}/post/${params.id}`;
  const images = post.image_url
    ? [
        {
          url: post.image_url,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ]
    : undefined;
  const tags = safeTags(post.tags);

  return {
    title: post.title,
    description,
    alternates: { canonical: `/post/${params.id}` },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.created_at,
      images,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  if (!post) notFound();

  const tags = safeTags(post.tags);
  const product = post.product;
  const hasDeal = Boolean(product?.asin);

  return (
    <article className="pb-16">
      <header className="container-site max-w-prose pt-10 text-center md:pt-14">
        <Link href="/" className="text-sm font-semibold text-coral-600 hover:underline">
          ← Back to all deals
        </Link>
        <h1 className="mt-5 font-display text-3xl font-black leading-tight text-plum-800 md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-plum-400">
          <time>{formatDate(post.created_at)}</time>
          {post.blog_name && <> · in {post.blog_name}</>}
        </p>
        <AdDisclosure variant="full" className="mt-5 text-left" />
      </header>

      {post.image_url && (
        <div className="container-site mt-8 max-w-4xl">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-plum-100 bg-white shadow-card">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {product && (
        <aside className="container-site mt-10 max-w-prose">
          <div className="rounded-3xl border border-coral-200 bg-coral-50/60 p-5 md:p-6">
            <div className="grid items-center gap-5 md:grid-cols-[120px_1fr_auto]">
              <div className="relative aspect-square w-full max-w-[120px] overflow-hidden rounded-2xl bg-white">
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  sizes="120px"
                  className="object-contain p-2"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-coral-600">Featured deal</p>
                <p className="mt-0.5 line-clamp-2 font-semibold text-plum-800">{product.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <PriceTag price={product.price} listPrice={product.list_price} />
                  <DealBadges
                    hasDeal={product.has_deal}
                    hasCoupon={product.has_coupon}
                    dealScore={product.deal_score}
                    dealText={product.deal_text}
                    couponText={product.coupon_text}
                  />
                </div>
              </div>
              <div className="flex items-center md:justify-end">
                {product?.asin && (
                  <DealLink
                    asin={product.asin}
                    shortLink={product.short_link}
                    affiliateLink={product.affiliate_link}
                    className="btn-coral px-6 py-3 text-base"
                  >
                    Get it on Amazon
                  </DealLink>
                )}
              </div>
            </div>
          </div>
        </aside>
      )}

      <section
        className="container-site prose-mom mt-10 max-w-prose"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {hasDeal && product?.asin && (
        <div className="container-site mt-10 max-w-prose">
          <div className="rounded-3xl bg-plum-700 p-7 text-center text-white shadow-card md:p-9">
            <p className="text-xs font-bold uppercase tracking-wider text-coral-300">Ready to grab it?</p>
            <h3 className="mt-2 font-display text-2xl font-bold md:text-3xl">Tap below to open Amazon</h3>
            <DealLink
              asin={product.asin}
              shortLink={product.short_link}
              affiliateLink={product.affiliate_link}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-coral-500 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-coral-600"
            >
              Get this deal
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </DealLink>
            <p className="mt-3 text-xs text-plum-200">
              Affiliate link · {SITE_NAME} earns from qualifying purchases.
            </p>
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="container-site mt-10 max-w-prose">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t, i) => (
              <span key={i} className="rounded-full border border-plum-100 bg-white px-3 py-1 text-xs text-plum-500">
                #{t.replace(/^#/, '')}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
