import Link from 'next/link';

/**
 * FTC + Amazon Associates Operating Agreement compliance.
 *
 * The FTC (16 CFR Part 255) requires a "clear and conspicuous" disclosure of
 * affiliate relationships *near each recommendation*, not just in a footer.
 * Amazon's Operating Agreement (§5) further requires Associates to clearly
 * identify themselves as such — burying it in a footer can get the account
 * terminated. So we render this on every product surface.
 */

type Variant = 'compact' | 'full';

export function AdDisclosure({
  variant = 'compact',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === 'full') {
    return (
      <p
        className={
          'text-[12px] leading-relaxed text-plum-400 italic ' + className
        }
      >
        <span className="not-italic font-semibold tracking-wider text-plum-500">
          #ad ·{' '}
        </span>
        Links may pay us a commission. We appreciate your support!{' '}
        <Link
          href="/disclosure"
          className="font-medium text-plum-600 underline decoration-plum-200 underline-offset-2 hover:text-coral-600 hover:decoration-coral-300"
        >
          View our advertiser and editorial disclosure here
        </Link>
        . The content on this page is accurate as of the posting date; however,
        some of the offers mentioned may have expired.
      </p>
    );
  }

  return (
    <p
      className={
        'flex flex-wrap items-center gap-x-1.5 text-[11px] leading-snug text-plum-400 ' +
        className
      }
    >
      <span className="rounded-sm bg-plum-100 px-1 py-px text-[10px] font-bold uppercase tracking-wider text-plum-600">
        Ad
      </span>
      <span>
        Affiliate link — we may earn a commission.{' '}
        <Link
          href="/disclosure"
          className="underline decoration-plum-200 underline-offset-2 hover:text-coral-600 hover:decoration-coral-300"
        >
          Disclosure
        </Link>
      </span>
    </p>
  );
}
