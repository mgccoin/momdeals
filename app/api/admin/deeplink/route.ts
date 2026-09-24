import { NextRequest, NextResponse } from 'next/server';
import { fetchProduct } from '@/lib/api';
import { amazonUrl } from '@/lib/affiliate';
import { API_BASE, SITE_URL } from '@/lib/config';
import { extractAsin, isAmazonShortLink, withScheme } from '@/lib/deeplink';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// The API answers fast (cache hit, or 202 + a background job we poll), but give
// slow networks headroom. 60 s is inside every Vercel plan's ceiling.
export const maxDuration = 60;

const MAX_URLS = 25;
/** Publishing writes an AI post + pushes to social per link — keep batches small. */
const MAX_PUBLISH = 3;
const MAX_HOPS = 6;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export type JobStatus = 'queued' | 'pulling' | 'linking' | 'generating' | 'posting' | 'done' | 'error';

export type LinkResult = {
  input: string;
  asin: string | null;
  /** Set when an amzn.to / a.co / urlgeni.us link was expanded first. */
  resolvedUrl: string | null;
  status: JobStatus;
  /** Background job id on the API when the deep link is still being created. */
  jobId: string | null;
  /** THE deep link: the product's URLgenius link, which opens the Amazon app. */
  urlgeniusLink: string | null;
  /** The site's own smart link (redirects to the URLgenius link once it exists). */
  goLink: string | null;
  /** Canonical amazon.com affiliate URL. */
  affiliateUrl: string | null;
  title: string | null;
  image_url: string | null;
  inCatalog: boolean;
  willPublish: boolean;
  post: { id: string; title: string; created_at: string; webhook_status?: string } | null;
  postReused: boolean;
  socialStatus: string | null;
  error: string | null;
  note: string | null;
};

type ApiJob = {
  ok?: boolean;
  status?: JobStatus;
  job_id?: string | null;
  urlgenius_link?: string | null;
  product?: { title?: string; image_url?: string } | null;
  will_publish?: boolean;
  post?: LinkResult['post'];
  post_reused?: boolean;
  social_status?: string | null;
  generate_error?: string | null;
  link_error?: string | null;
  error?: string | null;
  note?: string | null;
};

function adminKey(): string {
  return (process.env.ADMIN_KEY || '').trim();
}

function authed(key: string | null | undefined): boolean {
  const expected = adminKey();
  return Boolean(expected) && (key || '').trim() === expected;
}

/** Follow short-link redirects hop-by-hop without downloading the product page. */
async function resolveShortLink(url: string): Promise<string> {
  let current = withScheme(url);
  for (let i = 0; i < MAX_HOPS; i++) {
    let res: Response;
    try {
      res = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
        cache: 'no-store',
        // A stalled short-link host must not hold the whole batch hostage.
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      return current;
    }
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      try {
        current = new URL(loc, current).toString();
      } catch {
        return current;
      }
      if (!isAmazonShortLink(current)) return current;
      continue;
    }
    return current;
  }
  return current;
}

/** Call the Express API with the admin key. Returns null when unreachable. */
async function callApi(
  path: string,
  init: { method: 'GET' | 'POST'; body?: string; timeoutMs?: number },
): Promise<Response | null> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      method: init.method,
      body: init.body,
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey() },
      cache: 'no-store',
      signal: AbortSignal.timeout(init.timeoutMs ?? 12000),
    });
  } catch {
    return null;
  }
}

function fromApi(base: LinkResult, data: ApiJob): LinkResult {
  return {
    ...base,
    status: data.status || 'error',
    jobId: data.job_id ?? base.jobId,
    urlgeniusLink: data.urlgenius_link ?? base.urlgeniusLink,
    title: data.product?.title || base.title,
    image_url: data.product?.image_url || base.image_url,
    inCatalog: base.inCatalog || Boolean(data.product && data.product.title),
    willPublish: data.will_publish ?? base.willPublish,
    post: data.post ?? base.post,
    postReused: Boolean(data.post_reused),
    socialStatus: data.social_status ?? base.socialStatus,
    error: data.error || data.link_error || data.generate_error || null,
    note: data.note ?? base.note,
  };
}

async function buildOne(input: string, publish: boolean, skipApi = false): Promise<LinkResult> {
  const base: LinkResult = {
    input,
    asin: null,
    resolvedUrl: null,
    status: 'error',
    jobId: null,
    urlgeniusLink: null,
    goLink: null,
    affiliateUrl: null,
    title: null,
    image_url: null,
    inCatalog: false,
    willPublish: publish,
    post: null,
    postReused: false,
    socialStatus: null,
    error: null,
    note: null,
  };

  const trimmed = input.trim();
  if (!trimmed) return { ...base, error: 'Empty line' };

  let resolved = trimmed;
  if (isAmazonShortLink(trimmed)) resolved = await resolveShortLink(trimmed);
  const resolvedUrl = resolved !== trimmed ? resolved : null;

  const asin = extractAsin(resolved);
  if (!asin) {
    return {
      ...base,
      resolvedUrl,
      error: resolvedUrl
        ? 'Short link expanded, but no ASIN was found at the destination.'
        : 'Could not find an Amazon ASIN in this link.',
    };
  }

  const siteBase = SITE_URL.replace(/\/$/, '');
  const withLinks: LinkResult = {
    ...base,
    asin,
    resolvedUrl,
    goLink: `${siteBase}/go/${asin}`,
    affiliateUrl: amazonUrl(asin),
  };

  // Ask the API to return the URLgenius deep link, creating it if needed
  // (and, optionally, to publish a post about the product).
  // When an earlier line in this batch already found the API unreachable, skip
  // straight to the cached-data fallback instead of paying the timeout again.
  const res = skipApi
    ? null
    : await callApi('/api/admin/deeplink', {
        method: 'POST',
        body: JSON.stringify({ asin, publish }),
      });

  if (!res || res.status === 404) {
    // API unreachable, or not yet deployed with this endpoint: fall back to
    // whatever deep link is already cached for the product.
    const product = await fetchProduct(asin).catch(() => null);
    const ug =
      product?.short_link && /urlgeni\.us/i.test(product.short_link) ? product.short_link : null;
    return {
      ...withLinks,
      status: ug ? 'done' : 'error',
      urlgeniusLink: ug,
      title: product?.title ?? null,
      image_url: product?.image_url ?? null,
      inCatalog: Boolean(product),
      willPublish: false,
      error: ug
        ? null
        : res
          ? 'The API has not been updated with the deep-link creator yet. Deploy momdeals-api and try again.'
          : 'Could not reach the API.',
      note: ug
        ? res
          ? 'API not updated yet; showing the cached deep link.'
          : 'API unreachable; showing the cached deep link.'
        : null,
    };
  }

  const data = (await res.json().catch(() => ({}))) as ApiJob;
  if (!res.ok) return { ...withLinks, error: data.error || `API error ${res.status}` };
  return fromApi(withLinks, data);
}

// POST /api/admin/deeplink   body: { key, urls: string[], publish?: boolean }
export async function POST(req: NextRequest) {
  let body: { key?: string; urls?: unknown; url?: unknown; publish?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const key = body.key ?? req.nextUrl.searchParams.get('key');
  if (!authed(key)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let list: string[] = [];
  if (Array.isArray(body.urls)) list = body.urls.map((u) => String(u ?? ''));
  else if (typeof body.url === 'string') list = body.url.split(/\r?\n/);
  list = list.map((s) => s.trim()).filter(Boolean);

  if (list.length === 0) {
    return NextResponse.json({ error: 'Paste at least one Amazon link.' }, { status: 400 });
  }
  if (list.length > MAX_URLS) {
    return NextResponse.json({ error: `Max ${MAX_URLS} links per batch.` }, { status: 400 });
  }
  const publish = body.publish === true;
  if (publish && list.length > MAX_PUBLISH) {
    return NextResponse.json(
      { error: `Publishing is limited to ${MAX_PUBLISH} links at a time.` },
      { status: 400 },
    );
  }

  // Sequential on purpose: the API serializes its Chromium work anyway, and
  // this keeps a 25-link paste from opening 25 parallel upstream requests.
  const results: LinkResult[] = [];
  const startedAt = Date.now();
  let apiDown = false;
  for (const u of list) {
    // Stay well inside maxDuration: return what we have rather than let Vercel
    // kill the function and lose every result (and every queued job id).
    if (Date.now() - startedAt > 45_000) {
      results.push({
        input: u,
        asin: null,
        resolvedUrl: null,
        status: 'error',
        jobId: null,
        urlgeniusLink: null,
        goLink: null,
        affiliateUrl: null,
        title: null,
        image_url: null,
        inCatalog: false,
        willPublish: publish,
        post: null,
        postReused: false,
        socialStatus: null,
        error: 'Ran out of time; try fewer links at once.',
        note: null,
      });
      continue;
    }
    const r = await buildOne(u, publish, apiDown);
    if (r.error === 'Could not reach the API.' || (r.note || '').startsWith('API unreachable')) apiDown = true;
    results.push(r);
  }

  return NextResponse.json({ results, generated_at: new Date().toISOString() });
}

// GET /api/admin/deeplink?key=...&job=...   → poll a background job
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!authed(key)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const job = (req.nextUrl.searchParams.get('job') || '').trim();
  if (!job) return NextResponse.json({ error: 'job required' }, { status: 400 });

  const res = await callApi(`/api/admin/deeplink/${encodeURIComponent(job)}`, {
    method: 'GET',
    timeoutMs: 15000,
  });
  if (!res) return NextResponse.json({ error: 'Could not reach the API.' }, { status: 502 });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
