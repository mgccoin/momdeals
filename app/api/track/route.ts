import type { NextRequest } from 'next/server';
import { API_BASE } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Same-origin click tracker. The "Get this deal" button fires a beacon here
 * (no CORS, keeps the API base private); we forward it to the Express API,
 * which records it for the admin analytics dashboard. Always returns 204.
 */
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    let body: { asin?: string; source?: string } = {};
    try {
      body = JSON.parse(text || '{}');
    } catch {
      /* ignore malformed */
    }
    const asin = String(body.asin || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
    if (/^[A-Z0-9]{10}$/.test(asin)) {
      await fetch(`${API_BASE}/api/public/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin, source: String(body.source || '').slice(0, 200) }),
      }).catch(() => {});
    }
  } catch {
    /* never fail a click */
  }
  return new Response(null, { status: 204 });
}
