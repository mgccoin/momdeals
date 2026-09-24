import type { Metadata } from 'next';
import Link from 'next/link';
import { API_BASE } from '@/lib/config';
import { formatPrice } from '@/lib/format';
import PromoManager from '@/components/PromoManager';
import LinkGenerator from '@/components/LinkGenerator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
};

type TopProduct = {
  asin: string;
  clicks: number;
  clicks_7d: number;
  title: string | null;
  image_url: string | null;
  price: string | null;
  list_price: string | null;
  deal_score: number | null;
  has_coupon: number | null;
  has_deal: number | null;
  review_count: number | null;
  rating: number | null;
};

type Analytics = {
  totals: {
    total_clicks: number;
    clicks_24h: number;
    clicks_7d: number;
    clicks_30d: number;
    products_clicked: number;
  };
  topAll: TopProduct[];
  daily: { day: string; clicks: number }[];
  sources: { source: string; clicks: number }[];
  catalog: { products: number; on_deal: number; with_coupon: number; published_posts: number };
  generated_at: string;
};

async function getAnalytics(): Promise<Analytics | null> {
  const key = (process.env.ADMIN_KEY || '').trim();
  if (!key) return null;
  try {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, {
      headers: { 'x-admin-key': key },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as Analytics;
  } catch {
    return null;
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string; tab?: string };
}) {
  const expected = (process.env.ADMIN_KEY || '').trim();
  const key = (searchParams.key || '').trim();
  const authed = Boolean(expected) && key === expected;
  const tab =
    searchParams.tab === 'promo' ? 'promo' : searchParams.tab === 'links' ? 'links' : 'analytics';

  if (!authed) {
    return (
      <section className="container-site flex min-h-[60vh] items-center justify-center py-16">
        <form className="w-full max-w-sm rounded-3xl border border-plum-100 bg-white p-8 shadow-card" method="GET">
          <h1 className="font-display text-2xl font-black text-plum-800">Private dashboard</h1>
          <p className="mt-2 text-sm text-plum-500">Enter your access key to view analytics.</p>
          <input
            type="password"
            name="key"
            placeholder="Access key"
            autoComplete="off"
            className="mt-5 w-full rounded-2xl border border-plum-200 px-4 py-3 text-plum-800 outline-none focus:border-coral-400"
          />
          <button type="submit" className="btn-coral mt-4 w-full py-3">View analytics</button>
        </form>
      </section>
    );
  }

  const tabs = (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex rounded-2xl border border-plum-100 bg-white p-1 shadow-card">
        <Link
          href={`/admin?key=${encodeURIComponent(key)}`}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'analytics' ? 'bg-coral-500 text-white' : 'text-plum-500 hover:text-plum-800'
          }`}
        >
          Analytics
        </Link>
        <Link
          href={`/admin?key=${encodeURIComponent(key)}&tab=promo`}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'promo' ? 'bg-coral-500 text-white' : 'text-plum-500 hover:text-plum-800'
          }`}
        >
          Promo Codes
        </Link>
        <Link
          href={`/admin?key=${encodeURIComponent(key)}&tab=links`}
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            tab === 'links' ? 'bg-coral-500 text-white' : 'text-plum-500 hover:text-plum-800'
          }`}
        >
          Link Generator
        </Link>
      </div>
      <Link href="/" className="btn-ghost">← Back to site</Link>
    </div>
  );

  if (tab === 'promo') {
    return (
      <section className="container-site py-12">
        {tabs}
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-coral-500">Private · owner only</p>
          <h1 className="mt-1 font-display text-4xl font-black text-plum-800">Promo codes</h1>
        </header>
        <PromoManager adminKey={key} />
      </section>
    );
  }

  if (tab === 'links') {
    return (
      <section className="container-site py-12">
        {tabs}
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-coral-500">Private · owner only</p>
          <h1 className="mt-1 font-display text-4xl font-black text-plum-800">Link generator</h1>
          <p className="mt-2 text-sm text-plum-500">
            Paste any Amazon link and get the MomDeals deep link that opens the Amazon app with your tag.
          </p>
        </header>
        <LinkGenerator adminKey={key} />
      </section>
    );
  }

  const data = await getAnalytics();

  if (!data) {
    return (
      <section className="container-site py-16">
        {tabs}
        <h1 className="font-display text-3xl font-black text-plum-800">Analytics</h1>
        <p className="mt-3 text-coral-600">
          Couldn’t load analytics. Make sure <code>ADMIN_KEY</code> matches on both the site and the API.
        </p>
      </section>
    );
  }

  const { totals, topAll, daily, sources, catalog } = data;
  const maxDaily = Math.max(1, ...daily.map((d) => d.clicks));

  return (
    <section className="container-site py-12">
      {tabs}
      <header className="mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-coral-500">Private · owner only</p>
          <h1 className="mt-1 font-display text-4xl font-black text-plum-800">Click analytics</h1>
          <p className="mt-2 text-sm text-plum-500">
            Updated {new Date(data.generated_at).toLocaleString('en-US')}
          </p>
        </div>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Clicks today"   value={totals.clicks_24h} accent />
        <Stat label="Last 7 days"    value={totals.clicks_7d} />
        <Stat label="Last 30 days"   value={totals.clicks_30d} />
        <Stat label="All-time clicks" value={totals.total_clicks} />
        <Stat label="Products clicked" value={totals.products_clicked} />
      </div>

      {/* Daily trend */}
      <div className="mt-8 rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-plum-800">Clicks · last 14 days</h2>
        {daily.length === 0 ? (
          <p className="mt-4 text-sm text-plum-500">No clicks recorded yet. Data appears as visitors tap “Get this deal”.</p>
        ) : (
          <div className="mt-6 flex h-40 items-end gap-2">
            {daily.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2" title={`${d.day}: ${d.clicks} clicks`}>
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-coral-400"
                    style={{ height: `${Math.round((d.clicks / maxDaily) * 100)}%`, minHeight: d.clicks > 0 ? 4 : 0 }}
                  />
                </div>
                <span className="text-[10px] text-plum-400">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* Top products */}
        <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
          <h2 className="font-display text-xl font-bold text-plum-800">Top products by clicks</h2>
          <p className="mt-1 text-sm text-plum-500">Make more posts like these — they’re what people tap.</p>
          {topAll.length === 0 ? (
            <p className="mt-4 text-sm text-plum-500">No product clicks yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {topAll.map((p, i) => (
                <div key={p.asin} className="flex items-center gap-3 rounded-2xl border border-plum-50 p-2.5">
                  <span className="w-6 text-center font-display text-lg font-black text-plum-300">{i + 1}</span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-plum-50">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt="" className="h-full w-full object-contain p-1" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${p.asin}`} className="line-clamp-1 text-sm font-semibold text-plum-800 hover:text-coral-600">
                      {p.title || p.asin}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-plum-400">
                      <span className="font-mono">{p.asin}</span>
                      {formatPrice(p.price) && <span className="text-coral-600">{formatPrice(p.price)}</span>}
                      {p.has_coupon ? <span className="text-sage-600">coupon</span> : null}
                      {p.has_deal ? <span className="text-coral-500">deal</span> : null}
                      {p.review_count ? <span>{p.review_count.toLocaleString()} reviews</span> : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-black text-plum-800">{p.clicks}</div>
                    <div className="text-[10px] uppercase tracking-wider text-plum-400">{p.clicks_7d} this wk</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sources + catalog */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-plum-800">Top pages</h2>
            {sources.length === 0 ? (
              <p className="mt-3 text-sm text-plum-500">No data yet.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {sources.map((s) => (
                  <li key={s.source} className="flex items-center justify-between gap-3">
                    <span className="line-clamp-1 text-plum-600">{s.source}</span>
                    <span className="font-semibold text-plum-800">{s.clicks}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-plum-800">Catalog</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <Snapshot label="Products" value={catalog.products} />
              <Snapshot label="On deal" value={catalog.on_deal} />
              <Snapshot label="With coupon" value={catalog.with_coupon} />
              <Snapshot label="Published posts" value={catalog.published_posts} />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 shadow-card ${accent ? 'border-coral-200 bg-coral-50' : 'border-plum-100 bg-white'}`}>
      <div className="font-display text-3xl font-black text-plum-800">{(value ?? 0).toLocaleString()}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-plum-400">{label}</div>
    </div>
  );
}

function Snapshot({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-plum-400">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-bold text-plum-800">{(value ?? 0).toLocaleString()}</dd>
    </div>
  );
}
