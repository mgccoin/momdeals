import type { MetadataRoute } from 'next';
import { fetchFeed, fetchProducts } from '@/lib/api';
import { SITE_URL } from '@/lib/config';
import { postPath } from '@/lib/slug';
import { CATEGORIES } from '@/lib/categories';

const MAX_PAGES = 40; // safety cap (≈ a few thousand URLs)

async function allFeedItems() {
  const items: { id: string; title: string; created_at: string }[] = [];
  const first = await fetchFeed({ page: 1, limit: 100 }).catch(() => null);
  if (!first) return items;
  const pages = Math.min(first.pages || 1, MAX_PAGES);
  items.push(...(first.items ?? []));
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      fetchFeed({ page: i + 2, limit: 100 }).catch(() => null)
    )
  );
  for (const r of rest) if (r?.items) items.push(...r.items);
  return items;
}

async function allProducts() {
  const products: { asin: string; updated_at?: string }[] = [];
  const first = await fetchProducts({ page: 1, limit: 100 }).catch(() => null);
  if (!first) return products;
  const pages = Math.min(first.pages || 1, MAX_PAGES);
  products.push(...(first.products ?? []));
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) =>
      fetchProducts({ page: i + 2, limit: 100 }).catch(() => null)
    )
  );
  for (const r of rest) if (r?.products) products.push(...r.products);
  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,         lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${SITE_URL}/deals`,    lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily',  priority: 0.8 },
    { url: `${SITE_URL}/about`,    lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/deals/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const [feed, products] = await Promise.all([allFeedItems(), allProducts()]);

  const postPages: MetadataRoute.Sitemap = feed.map((p) => ({
    url: `${SITE_URL}${postPath(p)}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.asin)
    .map((p) => ({
      url: `${SITE_URL}/product/${p.asin}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

  return [...staticPages, ...categoryPages, ...postPages, ...productPages];
}
