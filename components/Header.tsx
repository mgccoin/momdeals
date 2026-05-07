import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';

const NAV = [
  { href: '/',         label: 'Home' },
  { href: '/deals',    label: 'Deals' },
  { href: '/products', label: 'Products' },
  { href: '/about',    label: 'About' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-plum-100/70 bg-cream/85 backdrop-blur">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-coral-500 text-white shadow-card">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <span className="font-display text-2xl font-black tracking-tight text-plum-800">
            Mom<span className="text-coral-500">Deals</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-plum-600 transition hover:bg-coral-50 hover:text-coral-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/deals" className="btn-coral">
            Today's Deals
          </Link>
        </div>

        <Link href="/deals" className="btn-coral md:hidden" aria-label="Today's Deals">
          Deals
        </Link>
      </div>
      <div className="md:hidden border-t border-plum-100/70">
        <nav className="container-site flex items-center gap-1 overflow-x-auto py-2">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold text-plum-600 hover:bg-coral-50 hover:text-coral-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
