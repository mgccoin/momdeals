type Variant = 'deal' | 'coupon' | 'lowest' | 'amazon' | 'new' | 'urgent';

const STYLES: Record<Variant, string> = {
  deal:    'bg-coral-100 text-coral-700',
  coupon:  'bg-sage-600  text-white',
  lowest:  'bg-plum-100  text-plum-800',
  amazon:  'bg-yellow-100 text-yellow-800',
  new:     'bg-coral-50  text-coral-600',
  urgent:  'bg-coral-600 text-white ring-1 ring-coral-700/20',
};

export function DealBadge({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  return <span className={`pill ${STYLES[variant]}`}>{children}</span>;
}

export function DealBadges({
  hasDeal,
  hasCoupon,
  dealScore,
  dealText,
  couponText,
}: {
  hasDeal?: number | null;
  hasCoupon?: number | null;
  dealScore?: number | null;
  dealText?: string | null;
  couponText?: string | null;
}) {
  const items: { variant: Variant; label: string }[] = [];

  // "Limited time deal", "Lightning deal", "Prime", etc. → time-pressure badge.
  const dt = (dealText || '').toLowerCase();
  const endingSoon = /limited time|lightning|today only|ends|deal of the day|expires|prime/.test(dt);

  if (hasDeal) {
    if (endingSoon) items.push({ variant: 'urgent', label: 'Ends soon' });
    else {
      const t = dealText?.trim();
      items.push({ variant: 'deal', label: t && t.length <= 16 ? t : 'Deal' });
    }
  }
  if (hasCoupon) {
    const c = couponText?.trim();
    items.push({ variant: 'coupon', label: c && c.length <= 16 ? c : 'Coupon!' });
  }
  if ((dealScore ?? 0) >= 70) items.push({ variant: 'lowest', label: 'Lowest in 30 days' });

  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it, i) => (
        <DealBadge key={i} variant={it.variant}>{it.label}</DealBadge>
      ))}
    </div>
  );
}
