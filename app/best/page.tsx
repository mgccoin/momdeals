import type { Metadata } from 'next';
import Link from 'next/link';
import { REVALIDATE_SECONDS, SITE_NAME, SITE_URL } from '@/lib/config';
import { ROUNDUPS, roundupHeading } from '@/lib/roundups';

export const revalidate = REVALIDATE_SECONDS;

const TITLE = 'Best Of — Amazon Buying Guides for Moms';
const DESCRIPTION =
  'Mom-tested buying guides ranking the best Amazon deals on air fryers, baby monitors, strollers, car seats, and more — updated daily by deal strength and reviews.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/best' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/best`,
    siteName: SITE_NAME,
    type: 'website',
  },
};

export default function BestIndexPage() {
  const year = new Date().getFullYear();
  return (
    <section className="container-site py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-black text-plum-800 md:text-5xl">
          Best Of: Amazon Buying Guides
        </h1>
        <p className="mt-3 text-plum-600">
          Our editors’ shortlists of the best Amazon deals in each category, ranked by current discount
          and verified reviews and refreshed every day.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ROUNDUPS.map((r) => (
          <Link
            key={r.slug}
            href={`/best/${r.slug}`}
            className="group flex flex-col rounded-3xl border border-plum-100 bg-white p-6 shadow-card transition hover:shadow-cardHover"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-coral-500">
              Buying Guide · {year}
            </span>
            <h2 className="mt-2 font-display text-xl font-bold text-plum-800 group-hover:text-coral-600">
              {roundupHeading(r, year)}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-plum-500">{r.intro}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-coral-600">
              See the picks
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
