import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

function shortLabel(heading: string): string {
  return heading
    .replace('Amazon Deals for ', '')
    .replace(/ Deals.*$/, '')
    .replace(/ & .*$/, '');
}

export function CategoryNav({ active }: { active?: string }) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/deals"
        className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
          !active
            ? 'border-coral-500 bg-coral-500 text-white'
            : 'border-plum-100 bg-white text-plum-600 hover:border-coral-300 hover:text-coral-600'
        }`}
      >
        All deals
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/deals/${c.slug}`}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
            active === c.slug
              ? 'border-coral-500 bg-coral-500 text-white'
              : 'border-plum-100 bg-white text-plum-600 hover:border-coral-300 hover:text-coral-600'
          }`}
        >
          {shortLabel(c.heading)}
        </Link>
      ))}
    </nav>
  );
}
