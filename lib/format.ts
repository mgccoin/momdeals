/**
 * "$24.99" → 24.99. Returns null if not parseable.
 */
export function parsePrice(raw?: string | null): number | null {
  if (!raw) return null;
  const m = String(raw).match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return parseFloat(m[1]);
}

export function formatPrice(raw?: string | null): string | null {
  if (!raw) return null;
  const n = parsePrice(raw);
  if (n == null) return null;
  return `$${n.toFixed(2).replace(/\.00$/, '')}`;
}

export function discountPercent(price?: string | null, listPrice?: string | null): number | null {
  const p = parsePrice(price);
  const l = parsePrice(listPrice);
  if (p == null || l == null || l <= p) return null;
  return Math.round(((l - p) / l) * 100);
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60_000);
  if (min < 1)  return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 30)   return `${d} day${d === 1 ? '' : 's'} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12)  return `${mo} mo ago`;
  const y = Math.floor(mo / 12);
  return `${y} yr${y === 1 ? '' : 's'} ago`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function safeTags(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String).slice(0, 8);
  } catch (_) {
    // not JSON — fall through
  }
  return String(raw).split(',').map(s => s.trim()).filter(Boolean).slice(0, 8);
}
