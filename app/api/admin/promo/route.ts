import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '@/lib/config';

export const dynamic = 'force-dynamic';

function authed(key: string | null): boolean {
  const expected = (process.env.ADMIN_KEY || '').trim();
  return Boolean(expected) && (key || '').trim() === expected;
}

// GET /api/admin/promo?key=...  → list current promo-coded products
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!authed(key)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const res = await fetch(`${API_BASE}/api/admin/promos`, {
      headers: { 'x-admin-key': (process.env.ADMIN_KEY || '').trim() },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

// POST /api/admin/promo  → add/update a product with a manual coupon code
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}
  const key = (body.key as string) || req.nextUrl.searchParams.get('key');
  if (!authed(key)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { key: _omit, ...payload } = body;
  try {
    const res = await fetch(`${API_BASE}/api/admin/promo-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': (process.env.ADMIN_KEY || '').trim(),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

// DELETE /api/admin/promo?key=...&asin=...  → remove a promo code from a product
export async function DELETE(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  const asin = (req.nextUrl.searchParams.get('asin') || '').trim();
  if (!authed(key)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!asin) return NextResponse.json({ error: 'asin required' }, { status: 400 });
  try {
    const res = await fetch(`${API_BASE}/api/admin/promo/${encodeURIComponent(asin)}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': (process.env.ADMIN_KEY || '').trim() },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
