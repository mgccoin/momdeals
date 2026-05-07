type Variant = 'deal' | 'coupon' | 'lowest' | 'amazon' | 'new';

const STYLES: Record<Variant, string> = {
  deal:    'bg-coral-100 text-coral-700',
  coupon:  'bg-sage-100  text-sage-700',
  lowest:  'bg-plum-100  text-plum-800',
  amazon:  'bg-yellow-100 text-yellow-800',
  new:     'bg-coral-50  text-coral-600',
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
  if (hasDeal)   items.push({ variant: 'deal',   label: dealText?.trim() || 'Deal' });
  if (hasCoupon) items.push({ variant: 'coupon', label: couponText?.trim() || 'Coupon' });
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
