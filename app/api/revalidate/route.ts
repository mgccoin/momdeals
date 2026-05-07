import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-demand revalidation webhook.
 *
 *   GET  /api/revalidate?secret=...&path=/products
 *   POST /api/revalidate           (body: { secret, paths?: string[], tags?: string[] })
 *
 * Set REVALIDATE_SECRET in Vercel env to a long random string and call this
 * from the Express server (or scheduler) whenever new products/posts land.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!verify(secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const path = req.nextUrl.searchParams.get('path');
  const tag  = req.nextUrl.searchParams.get('tag');
  const did: string[] = [];
  if (path) { revalidatePath(path); did.push(`path:${path}`); }
  if (tag)  { revalidateTag(tag);   did.push(`tag:${tag}`); }
  if (!path && !tag) {
    revalidatePath('/');
    revalidatePath('/deals');
    revalidatePath('/products');
    did.push('default');
  }
  return NextResponse.json({ revalidated: true, did });
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* allow empty body */ }
  if (!verify(body?.secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const did: string[] = [];
  for (const p of body.paths ?? []) { revalidatePath(p); did.push(`path:${p}`); }
  for (const t of body.tags  ?? []) { revalidateTag(t);  did.push(`tag:${t}`); }
  if (did.length === 0) {
    revalidatePath('/');
    revalidatePath('/deals');
    revalidatePath('/products');
    did.push('default');
  }
  return NextResponse.json({ revalidated: true, did });
}

function verify(secret: unknown): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  return Boolean(expected) && typeof secret === 'string' && secret === expected;
}
