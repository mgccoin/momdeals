import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DealCard } from '@/components/DealCard';
import { CategoryNav } from '@/components/CategoryNav';
import { fetchFeed } from '@/lib/api';
import { REVALIDATE_SECONDS, SITE_NAME, SITE_URL } from '@/lib/config';
import { CATEGORIES, getCategory, matchesCategory } from '@/lib/categories';
import type { FeedItem } from '@/lib/types';

export const revalidate = REVALIDATE_SECONDS;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cat = getCategory(params.category);
  if (!cat) return { title: 'Category not found' };
  return {
    title: cat.title,
    description: cat.description,
    alternates: { canonical: `/deals/${cat.slug}` },
    openGraph: {
      title: cat.title,
      description: cat.description,
      url: `${SITE_URL}/deals/${cat.slug}`,
      siteName: SITE_NAME,
      type: 'website',
    },
  };
}

async function collect(catSlug: string): Promise<FeedItem[]> {
  const cat = getCategory(catSlug)!;
  const pages = await Promise.all(
    [1, 2, 3].map((p) => fetchFeed({ page: p, limit: 100 }).catch(() => null))
  );
  const all: FeedItem[] = [];
  for (const r of pages) if (r?.items) all.push(...r.items);
  return all.filter((it) => matchesCategory(cat, it));
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const items = await collect(cat.slug);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Deals', item: `${SITE_URL}/deals` },
      { '@type': 'ListItem', position: 3, name: cat.heading, item: `${SITE_URL}/deals/${cat.slug}` },
    ],
  };

  return (
    <section className="container-site py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="mb-8 max-w-2xl">
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-plum-500">
          <Link href="/deals" className="hover:text-coral-600">Deals</Link>
          <span>/</span>
          <span className="text-plum-700">{cat.heading}</span>
        </nav>
        <h1 className="font-display text-4xl font-black text-plum-800 md:text-5xl">
          {cat.heading}
        </h1>
        <p className="mt-3 text-plum-600">{cat.intro}</p>
      </header>

      <CategoryNav active={cat.slug} />

      {items.length > 0 ? (
        <div className="mt-8 grid gap-5">
          {items.map((item) => (
            <DealCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-plum-200 bg-white/60 px-8 py-16 text-center">
          <h3 className="font-display text-2xl font-bold text-plum-800">
            Fresh {cat.heading.toLowerCase()} landing soon
          </h3>
          <p className="mt-2 text-plum-500">
            Browse <Link href="/deals" className="font-semibold text-coral-600 hover:underline">all of today’s deals</Link> in the meantime.
          </p>
        </div>
      )}
    </section>
  );
}
