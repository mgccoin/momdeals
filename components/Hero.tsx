import Link from 'next/link';

export function Hero({
  eyebrow,
  title,
  subtitle,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden border-b border-plum-100/70 bg-gradient-to-br from-coral-50 via-cream to-plum-50">
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-coral-200/50 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-plum-200/40 blur-3xl" />
      <div className="container-site relative grid gap-8 py-14 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-coral-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-coral-500" />
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] text-plum-800 md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-plum-600">{subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {primary && (
              <Link href={primary.href} className="btn-coral px-6 py-3 text-base">
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} className="btn-ghost px-6 py-3 text-base">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>

        <Decoration />
      </div>
    </section>
  );
}

function Decoration() {
  // Friendly illustration: stacked, slightly tilted "deal cards"
  return (
    <div className="relative hidden aspect-[5/4] w-full md:block">
      <div className="absolute left-6 top-2 h-44 w-44 -rotate-6 rounded-3xl border border-plum-100 bg-white p-4 shadow-card">
        <div className="h-20 w-full rounded-2xl bg-gradient-to-br from-coral-200 to-coral-400" />
        <div className="mt-3 h-3 w-3/4 rounded-full bg-plum-100" />
        <div className="mt-2 h-3 w-1/2 rounded-full bg-plum-100" />
        <div className="mt-3 inline-flex rounded-full bg-coral-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          -42%
        </div>
      </div>
      <div className="absolute right-2 top-12 h-52 w-52 rotate-3 rounded-3xl border border-plum-100 bg-white p-4 shadow-cardHover">
        <div className="h-24 w-full rounded-2xl bg-gradient-to-br from-plum-200 to-plum-400" />
        <div className="mt-3 h-3 w-4/5 rounded-full bg-plum-100" />
        <div className="mt-2 h-3 w-2/3 rounded-full bg-plum-100" />
        <div className="mt-3 inline-flex rounded-full bg-sage-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Coupon
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 -rotate-3 rounded-3xl border border-plum-100 bg-white p-4 shadow-card">
        <div className="h-16 w-full rounded-2xl bg-gradient-to-br from-sage-200 to-sage-400" />
        <div className="mt-3 h-3 w-2/3 rounded-full bg-plum-100" />
        <div className="mt-2 h-3 w-1/2 rounded-full bg-plum-100" />
      </div>
    </div>
  );
}
