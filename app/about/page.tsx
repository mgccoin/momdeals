import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: 'About',
  description: `${SITE_NAME} curates Amazon deals on kitchen, baby, and everyday essentials for moms.`,
};

export default function AboutPage() {
  return (
    <article className="container-site max-w-prose py-14">
      <p className="text-xs font-bold uppercase tracking-wider text-coral-500">About</p>
      <h1 className="mt-2 font-display text-4xl font-black text-plum-800 md:text-5xl">
        Real-mom deals, no fluff.
      </h1>
      <div className="prose-mom mt-8">
        <p>
          {SITE_NAME} is a curated feed of Amazon deals built for the things moms actually
          buy: kitchen gadgets that save 15 minutes at dinner, baby essentials that survive
          a real toddler, pregnancy comforts, and the everyday must-haves that keep a
          household running.
        </p>
        <p>
          Every product card on this site has been hand-picked, scored for deal quality,
          and linked through our Amazon Associate tag. When you tap{' '}
          <strong>Get this deal</strong>, you go straight to Amazon — no popups, no spam.
        </p>
        <h2>How the deals get here</h2>
        <p>
          A small autopilot scans Amazon throughout the day, flags products with active
          discounts or stackable coupons, and writes a short, honest review of each one.
          We refresh the homepage every few minutes so what you see is what's live right now.
        </p>
        <h2>Disclosure</h2>
        <p>
          As an Amazon Associate, {SITE_NAME} earns from qualifying purchases. Prices and
          availability shown were accurate at publish time and can change at any moment.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/deals"    className="btn-coral px-6 py-3 text-base">See today's deals</Link>
        <Link href="/products" className="btn-ghost px-6 py-3 text-base">Browse products</Link>
      </div>
    </article>
  );
}
