import Link from 'next/link';

export function Pagination({
  page,
  pages,
  basePath,
}: {
  page: number;
  pages: number;
  basePath: string;
}) {
  if (pages <= 1) return null;

  const buildHref = (p: number) =>
    p === 1 ? basePath : `${basePath}${basePath.includes('?') ? '&' : '?'}page=${p}`;

  const windowed: (number | '…')[] = [];
  const add = (v: number | '…') => windowed.push(v);
  const last = pages;

  add(1);
  if (page > 3) add('…');
  for (let p = Math.max(2, page - 1); p <= Math.min(last - 1, page + 1); p++) add(p);
  if (page < last - 2) add('…');
  if (last > 1) add(last);

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      <PageLink disabled={page <= 1} href={buildHref(Math.max(1, page - 1))}>
        ← Prev
      </PageLink>
      {windowed.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-2 text-plum-400">…</span>
        ) : (
          <PageLink key={p} active={p === page} href={buildHref(p)}>
            {p}
          </PageLink>
        )
      )}
      <PageLink disabled={page >= pages} href={buildHref(Math.min(pages, page + 1))}>
        Next →
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const cls = `inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
    active
      ? 'bg-plum-700 text-white'
      : 'border border-plum-100 bg-white text-plum-700 hover:border-coral-300 hover:bg-coral-50 hover:text-coral-700'
  }`;
  if (disabled) {
    return (
      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-plum-100 bg-plum-50/40 px-3 text-sm font-semibold text-plum-300">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
