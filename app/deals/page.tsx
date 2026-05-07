import type { Metadata } from 'next';
import { DealCard } from '@/components/DealCard';
import { Pagination } from '@/components/Pagination';
import { fetchFeed } from '@/lib/api';
import { REVALIDATE_SECONDS } from '@/lib/config';

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Today's Deals",
  description:
    "Active Amazon deals and clipped coupons hand-picked for moms — kitchen, baby, and everyday savings refreshed throughout the day.",
};

export default async function DealsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const limit = 20;

  const feed = await fetchFeed({ page, limit, dealsOnly: true }).catch(() => null);
  const items = feed?.items ?? [];

  return (
    <section className="container-site py-12">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-coral-500">Don't blink</p>
        <h1 className="mt-2 font-display text-4xl font-black text-plum-800 md:text-5xl">
          Today's hottest deals
        </h1>
        <p className="mt-3 text-plum-600">
          Active discounts and clipped coupons — sorted by deal score, refreshed throughout the day.
        </p>
      </header>

      {!feed && (
        <div className="rounded-3xl border border-coral-200 bg-coral-50/60 px-6 py-8 text-coral-700">
          <h3 className="font-display text-xl font-bold">Deals service is offline.</h3>
          <p className="mt-1 text-sm text-coral-600">Check back in a moment.</p>
        </div>
      )}

      {feed && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-plum-200 bg-white/60 px-8 py-16 text-center">
          <h3 className="font-display text-2xl font-bold text-plum-800">No live deals right this second</h3>
          <p className="mt-2 text-plum-500">Browse <a href="/products" className="font-semibold text-coral-600 hover:underline">all products</a> while we restock.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-5">
          {items.map(item => (
            <DealCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {feed && (
        <Pagination page={feed.page} pages={feed.pages} basePath="/deals" />
      )}
    </section>
  );
}
