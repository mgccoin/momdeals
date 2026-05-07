import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductTile } from '@/components/ProductTile';
import { Pagination } from '@/components/Pagination';
import { fetchProducts } from '@/lib/api';
import { REVALIDATE_SECONDS } from '@/lib/config';

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: 'All Products',
  description:
    'Browse every Amazon product MomDeals is tracking — kitchen, baby, and home essentials with live pricing and deal alerts.',
};

const FILTERS = [
  { id: 'all',     label: 'All products',  query: ''        },
  { id: 'deals',   label: 'On deal',        query: '?filter=deals'   },
  { id: 'coupons', label: 'With coupon',    query: '?filter=coupons' },
] as const;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; filter?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const limit = 24;
  const filter = searchParams.filter ?? 'all';

  const data = await fetchProducts({
    page,
    limit,
    dealsOnly:   filter === 'deals',
    couponsOnly: filter === 'coupons',
  }).catch(() => null);

  const products = data?.products ?? [];
  const basePath = filter === 'all' ? '/products' : `/products?filter=${filter}`;

  return (
    <section className="container-site py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-coral-500">The product library</p>
          <h1 className="mt-2 font-display text-4xl font-black text-plum-800 md:text-5xl">
            Every product, ever found
          </h1>
          <p className="mt-3 text-plum-600">
            Each product gets its own page — with live pricing, deal status, and a one-tap link to Amazon.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map(f => (
            <Link
              key={f.id}
              href={`/products${f.query}`}
              className={
                'rounded-full px-4 py-2 text-sm font-semibold transition ' +
                (filter === f.id
                  ? 'bg-plum-700 text-white'
                  : 'border border-plum-100 bg-white text-plum-700 hover:border-coral-300 hover:bg-coral-50 hover:text-coral-700')
              }
            >
              {f.label}
            </Link>
          ))}
        </div>
      </header>

      {!data && (
        <div className="rounded-3xl border border-coral-200 bg-coral-50/60 px-6 py-8 text-coral-700">
          <h3 className="font-display text-xl font-bold">Products service is offline.</h3>
          <p className="mt-1 text-sm text-coral-600">Check back in a moment.</p>
        </div>
      )}

      {data && products.length === 0 && (
        <div className="rounded-3xl border border-dashed border-plum-200 bg-white/60 px-8 py-16 text-center">
          <h3 className="font-display text-2xl font-bold text-plum-800">Nothing here yet</h3>
          <p className="mt-2 text-plum-500">Try another filter — new products land throughout the day.</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map(p => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}

      {data && (
        <Pagination page={data.page} pages={data.pages} basePath={basePath} />
      )}
    </section>
  );
}
