import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-plum-100/70 bg-white/60">
      <div className="container-site grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-black text-plum-800">
            Mom<span className="text-coral-500">Deals</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-plum-500">
            Hand-picked Amazon deals for moms — kitchen gadgets that actually save you
            time, baby gear that survives real life, and everyday savings worth sharing.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-plum-500">Browse</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/"         className="text-plum-700 hover:text-coral-600">All deals</Link></li>
            <li><Link href="/deals"    className="text-plum-700 hover:text-coral-600">Today's deals</Link></li>
            <li><Link href="/products" className="text-plum-700 hover:text-coral-600">All products</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-plum-500">About</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about"   className="text-plum-700 hover:text-coral-600">Our story</Link></li>
            <li><Link href="/privacy" className="text-plum-700 hover:text-coral-600">Privacy</Link></li>
            <li><Link href="/disclosure" className="text-plum-700 hover:text-coral-600">Disclosure</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-plum-100/70 bg-plum-50/40">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-plum-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE_NAME}. As an Amazon Associate {SITE_NAME} earns from qualifying purchases.
          </p>
          <p>
            Prices and availability are accurate as of publish time and subject to change.
          </p>
        </div>
      </div>
    </footer>
  );
}
