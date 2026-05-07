import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-site py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-coral-500">404</p>
      <h1 className="mt-3 font-display text-5xl font-black text-plum-800">We couldn't find that one</h1>
      <p className="mx-auto mt-3 max-w-md text-plum-500">
        That deal might have wrapped up or moved. Try today's deals or browse all products.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/deals" className="btn-coral px-6 py-3 text-base">See today's deals</Link>
        <Link href="/products" className="btn-ghost px-6 py-3 text-base">Browse products</Link>
      </div>
    </div>
  );
}
