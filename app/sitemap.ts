import type { MetadataRoute } from 'next';
import { fetchFeed, fetchProducts } from '@/lib/api';
import { SITE_URL } from '@/lib/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,         lastModified: now, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${SITE_URL}/deals`,    lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
  ];

  const [feed, products] = await Promise.all([
    fetchFeed({ page: 1, limit: 50 }).catch(() => null),
    fetchProducts({ page: 1, limit: 60 }).catch(() => null),
  ]);

  const postPages: MetadataRoute.Sitemap = (feed?.items ?? []).map(p => ({
    url: `${SITE_URL}/post/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const productPages: MetadataRoute.Sitemap = (products?.products ?? [])
    .filter(p => p.asin)
    .map(p => ({
      url: `${SITE_URL}/product/${p.asin}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

  return [...staticPages, ...postPages, ...productPages];
}
