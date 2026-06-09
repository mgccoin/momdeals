// SEO-friendly post URLs: /post/<slugified-title>-<uuid>
// The trailing UUID is the canonical lookup key, so no backend change is needed.
// Old /post/<uuid> links keep working and 301-redirect to the slug URL.

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** "Ninja Crispi Air Fryer Deal!" → "ninja-crispi-air-fryer-deal" */
export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

/** Build the canonical path for a post, e.g. /post/ninja-air-fryer-deal-<uuid>. */
export function postPath(p: { id: string; title?: string | null }): string {
  const slug = slugify(p.title || '');
  return slug ? `/post/${slug}-${p.id}` : `/post/${p.id}`;
}

/** Pull the UUID out of a route param that may be "slug-uuid" or just "uuid". */
export function extractPostId(param: string): string {
  let decoded = param;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    /* keep raw */
  }
  const m = decoded.match(UUID_RE);
  return m ? m[0] : decoded;
}
