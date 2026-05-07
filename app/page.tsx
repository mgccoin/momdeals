import { DealCard } from '@/components/DealCard';
import { Hero } from '@/components/Hero';
import { Pagination } from '@/components/Pagination';
import { fetchFeed } from '@/lib/api';
import { REVALIDATE_SECONDS } from '@/lib/config';

export const revalidate = REVALIDATE_SECONDS;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const limit = 18;

  const feed = await fetchFeed({ page, limit }).catch(() => null);
  const items = feed?.items ?? [];

  const [feature, ...rest] = items;

  return (
    <>
      <Hero
        eyebrow="Fresh Amazon picks for moms"
        title={
          <>
            Smart deals,
            <br />
            <span className="text-coral-500">mom-tested</span> daily.
          </>
        }
        subtitle="Hand-picked Amazon discounts on kitchen gadgets, baby essentials, and the everyday must-haves moms actually use."
        primary={{ href: '/deals', label: "Today's deals" }}
        secondary={{ href: '/products', label: 'Browse products' }}
      />

      <section className="container-site py-12">
        {!feed && (
          <ApiError />
        )}

        {feature && (
          <div className="mb-10">
            <SectionHeading
              eyebrow="Top pick right now"
              title="The deal of the moment"
            />
            <DealCard item={feature} layout="feature" />
          </div>
        )}

        {rest.length > 0 && (
          <div>
            <SectionHeading
              eyebrow="All the latest"
              title="Today's hand-picked deals"
            />
            <div className="grid gap-5">
              {rest.map(item => (
                <DealCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {feed && items.length === 0 && (
          <EmptyState />
        )}

        {feed && (
          <Pagination page={feed.page} pages={feed.pages} basePath="/" />
        )}
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-coral-500">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl font-black text-plum-800 md:text-4xl">{title}</h2>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-plum-200 bg-white/60 px-8 py-16 text-center">
      <h3 className="font-display text-2xl font-bold text-plum-800">Digging up fresh deals…</h3>
      <p className="mt-2 text-plum-500">Check back soon — new picks land throughout the day.</p>
    </div>
  );
}

function ApiError() {
  return (
    <div className="rounded-3xl border border-coral-200 bg-coral-50/60 px-6 py-8 text-coral-700">
      <h3 className="font-display text-xl font-bold">We can't reach the deals service right now.</h3>
      <p className="mt-1 text-sm text-coral-600">
        Make sure the Express server (port 3003) is running and <code>MOMDEALS_API_BASE</code> is set
        correctly. Refresh in a moment.
      </p>
    </div>
  );
}
