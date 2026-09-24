/**
 * lib/deeplink.ts — helpers for the admin "Link Generator" tab.
 *
 * Turns anything an owner might paste (a full Amazon product URL in any of
 * Amazon's URL shapes, an amzn.to / a.co short link, or a bare ASIN) into a
 * canonical 10-character ASIN. The API route then builds the site's own
 * `/go/{ASIN}` deep link from that.
 */

const ASIN_RE = /^[A-Z0-9]{10}$/;

/** Amazon short-link hosts that must be resolved (redirect-followed) first. */
const SHORT_HOSTS = new Set([
  'amzn.to',
  'a.co',
  'urlgeni.us',
  'www.urlgeni.us',
  'amzn.com',
  'www.amzn.com',
  'amzn.eu',
  'amzn.asia',
]);

/** Return the ASIN in canonical uppercase form, or null if it isn't one. */
export function normalizeAsin(raw: string): string | null {
  const s = (raw || '').trim().toUpperCase();
  return ASIN_RE.test(s) ? s : null;
}

/** Ensure a scheme so `new URL()` accepts things like "amzn.to/abc". */
export function withScheme(input: string): string {
  const s = (input || '').trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** True for amzn.to / a.co style links that hide the ASIN behind a redirect. */
export function isAmazonShortLink(input: string): boolean {
  try {
    const u = new URL(withScheme(input));
    return SHORT_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Extract a 10-char ASIN from an Amazon URL (any marketplace) or a bare ASIN.
 *
 * Handles:  /dp/ASIN   /gp/product/ASIN   /gp/aw/d/ASIN (mobile)
 *           /exec/obidos/ASIN/ASIN   /product/ASIN   /ASIN/ASIN   ?asin=ASIN
 * Ignores everything after the ASIN (ref=, th=1, psc=1, tags, hashes, etc.).
 */
export function extractAsin(input: string): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;

  // 1. A bare ASIN pasted on its own.
  const bare = normalizeAsin(raw);
  if (bare) return bare;

  // 2. Parse as a URL so we only match inside the path / query.
  let path = raw;
  let search = '';
  try {
    const u = new URL(withScheme(raw));
    path = u.pathname;
    search = u.search;
    try {
      path = decodeURIComponent(path);
    } catch {
      /* keep the raw path if it isn't valid percent-encoding */
    }
  } catch {
    /* not a URL — fall through and scan the raw string */
  }

  const patterns: RegExp[] = [
    /\/dp\/([A-Z0-9]{10})(?=[\/?#]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?=[\/?#]|$)/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})(?=[\/?#]|$)/i,
    /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})(?=[\/?#]|$)/i,
    /\/product\/([A-Z0-9]{10})(?=[\/?#]|$)/i,
    /\/ASIN\/([A-Z0-9]{10})(?=[\/?#]|$)/i,
  ];
  for (const re of patterns) {
    const m = path.match(re);
    if (m) return m[1].toUpperCase();
  }

  // 3. ?asin=XXXXXXXXXX
  try {
    const qs = new URLSearchParams(search);
    const q = normalizeAsin(qs.get('asin') || qs.get('ASIN') || '');
    if (q) return q;
  } catch {
    /* ignore */
  }

  // 4. Last resort: a standalone modern "B0…" ASIN token anywhere in the path.
  const loose = (path + ' ' + search).match(/(?:^|[\/=])(B0[A-Z0-9]{8})(?=[\/?#=&]|$)/i);
  if (loose) return loose[1].toUpperCase();

  return null;
}
