'use client';

import { useCallback, useEffect, useState } from 'react';

type Promo = {
  asin: string;
  title: string | null;
  image_url: string | null;
  price: string | null;
  promo_code: string | null;
  promo_discount: string | null;
  coupon_text: string | null;
  updated_at: string | null;
};

export default function PromoManager({ adminKey }: { adminKey: string }) {
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [generateNow, setGenerateNow] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadPromos = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`/api/admin/promo?key=${encodeURIComponent(adminKey)}`, { cache: 'no-store' });
      const data = await res.json();
      setPromos(Array.isArray(data.promos) ? data.promos : []);
    } catch {
      setPromos([]);
    } finally {
      setLoadingList(false);
    }
  }, [adminKey]);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!url.trim() || !code.trim()) {
      setMessage({ kind: 'err', text: 'Paste the Amazon link and the coupon code.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          url: url.trim(),
          code: code.trim(),
          discount: discount.trim(),
          discountType,
          generateNow,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: 'err', text: data.error || 'Something went wrong.' });
      } else {
        const t = data.product?.title ? `“${String(data.product.title).slice(0, 50)}”` : 'the product';
        const postNote = data.post ? ' A post was created and will go to the site + Facebook/Instagram shortly.' : '';
        const genErr = data.generate_error ? ` (Saved, but post generation failed: ${data.generate_error})` : '';
        setMessage({ kind: 'ok', text: `Saved ${t} with code ${code.trim().toUpperCase()}.${postNote}${genErr}` });
        setUrl('');
        setCode('');
        setDiscount('');
        loadPromos();
      }
    } catch (err) {
      setMessage({ kind: 'err', text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(asin: string) {
    if (!confirm('Remove this coupon code from the product?')) return;
    try {
      await fetch(`/api/admin/promo?key=${encodeURIComponent(adminKey)}&asin=${encodeURIComponent(asin)}`, {
        method: 'DELETE',
      });
      loadPromos();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      {/* Add form */}
      <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-plum-800">Add a coupon code</h2>
        <p className="mt-1 text-sm text-plum-500">
          Paste the Amazon product link and the code Amazon gave you. We’ll pull the product, attach the code, and push
          it to the site and your social posts.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-plum-400">Amazon product link</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/B0..."
              className="mt-1.5 w-full rounded-2xl border border-plum-200 px-4 py-3 text-plum-800 outline-none focus:border-coral-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-plum-400">Coupon code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SAVE20"
                className="mt-1.5 w-full rounded-2xl border border-plum-200 px-4 py-3 font-mono uppercase text-plum-800 outline-none focus:border-coral-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-plum-400">Discount</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-2xl border border-plum-200 px-4 py-3 text-plum-800 outline-none focus:border-coral-400"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
                  className="rounded-2xl border border-plum-200 px-3 py-3 text-plum-800 outline-none focus:border-coral-400"
                >
                  <option value="percent">%</option>
                  <option value="amount">$</option>
                </select>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-plum-600">
            <input
              type="checkbox"
              checked={generateNow}
              onChange={(e) => setGenerateNow(e.target.checked)}
              className="h-4 w-4 rounded border-plum-300 text-coral-500"
            />
            Create &amp; publish a post now (site + Facebook/Instagram)
          </label>
          <button type="submit" disabled={submitting} className="btn-coral w-full py-3 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Save & push to posts'}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              message.kind === 'ok' ? 'bg-sage-50 text-sage-700' : 'bg-coral-50 text-coral-700'
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Active promos */}
      <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-plum-800">Active coupon codes</h2>
        <p className="mt-1 text-sm text-plum-500">These products show the code on the site and in social posts.</p>
        {loadingList ? (
          <p className="mt-4 text-sm text-plum-500">Loading…</p>
        ) : promos.length === 0 ? (
          <p className="mt-4 text-sm text-plum-500">No coupon codes yet. Add one on the left.</p>
        ) : (
          <div className="mt-5 space-y-3">
            {promos.map((p) => (
              <div key={p.asin} className="flex items-center gap-3 rounded-2xl border border-plum-50 p-2.5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-plum-50">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-contain p-1" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold text-plum-800">{p.title || p.asin}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-plum-400">
                    <span className="rounded-md bg-sage-100 px-1.5 py-0.5 font-mono font-bold text-sage-700">
                      {p.promo_code}
                    </span>
                    {p.promo_discount && <span className="text-coral-600">{p.promo_discount} off</span>}
                    <span className="font-mono">{p.asin}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.asin)}
                  className="rounded-xl border border-plum-200 px-3 py-1.5 text-xs font-semibold text-plum-500 hover:border-coral-300 hover:text-coral-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
