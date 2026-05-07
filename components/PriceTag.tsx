import { discountPercent, formatPrice } from '@/lib/format';

export function PriceTag({
  price,
  listPrice,
  size = 'md',
  align = 'left',
}: {
  price?: string | null;
  listPrice?: string | null;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
}) {
  const p = formatPrice(price);
  const l = formatPrice(listPrice);
  const off = discountPercent(price, listPrice);

  if (!p) return null;

  const sizes = {
    sm: { price: 'text-base', list: 'text-xs',  off: 'text-[10px]' },
    md: { price: 'text-xl',   list: 'text-sm',  off: 'text-xs' },
    lg: { price: 'text-3xl',  list: 'text-base', off: 'text-sm' },
  } as const;
  const s = sizes[size];

  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
      <span className={`font-display font-black text-coral-600 ${s.price}`}>{p}</span>
      {l && l !== p && (
        <span className={`text-plum-400 line-through ${s.list}`}>{l}</span>
      )}
      {off != null && off >= 5 && (
        <span className={`pill bg-coral-500 text-white ${s.off}`}>{off}% off</span>
      )}
    </div>
  );
}
