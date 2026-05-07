import { API_BASE, BLOG_ID, REVALIDATE_SECONDS } from './config';
import type { FeedItem, Paginated, Post, Product } from './types';

type FetchOpts = {
  /** Override revalidate seconds. Pass 0 for no-cache. */
  revalidate?: number;
};

async function apiGet<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const revalidate = opts.revalidate ?? REVALIDATE_SECONDS;
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText} on ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Combined feed (homepage + /deals) ────────────────────────────────────────

export async function fetchFeed(params: {
  page?: number;
  limit?: number;
  dealsOnly?: boolean;
} = {}): Promise<Paginated<FeedItem>> {
  const qs = new URLSearchParams();
  qs.set('blogId', BLOG_ID);
  if (params.page)  qs.set('page',  String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.dealsOnly) qs.set('dealsOnly', '1');
  return apiGet<Paginated<FeedItem>>(`/api/public/feed?${qs}`);
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  dealsOnly?: boolean;
  couponsOnly?: boolean;
} = {}): Promise<Paginated<Product>> {
  const qs = new URLSearchParams();
  if (params.page)  qs.set('page',  String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.dealsOnly)   qs.set('dealsOnly', '1');
  if (params.couponsOnly) qs.set('couponsOnly', '1');
  return apiGet<Paginated<Product>>(`/api/public/products?${qs}`);
}

export async function fetchProduct(asin: string): Promise<
  (Product & { post: { id: string; title: string; excerpt: string; image_url: string; created_at: string } | null }) | null
> {
  try {
    return await apiGet(`/api/public/products/${encodeURIComponent(asin)}`);
  } catch (e) {
    return null;
  }
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function fetchPost(id: string): Promise<Post | null> {
  try {
    return await apiGet<Post>(`/api/public/post/${encodeURIComponent(id)}`);
  } catch (e) {
    return null;
  }
}

// ── Blog meta ────────────────────────────────────────────────────────────────

export async function fetchBlog(): Promise<{ id: string; name: string; niche: string; description: string } | null> {
  try {
    return await apiGet(`/api/public/blog/${BLOG_ID}`);
  } catch (e) {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Best-effort: returns true if an item has a current deal/coupon worth a badge.
 */
export function isHotDeal(it: Pick<FeedItem, 'ap_has_deal' | 'ap_has_coupon' | 'ap_deal_score'>): boolean {
  return Boolean(it.ap_has_deal) || Boolean(it.ap_has_coupon) || (it.ap_deal_score ?? 0) >= 50;
}
