# MomDeals — Next.js site

A DansDeals-style storefront for the Amazon products and posts produced by
the autopilot in the parent `Amazon Blog/` project. Each scraped product
becomes a `/product/[asin]` page automatically; each generated blog post
gets a `/post/[id]` page; everything funnels visitors through `/go/[asin]`,
which deeplinks to the Amazon app (with the affiliate tag) or falls back
to the web URL.

Lives at: **https://momdeals.org**

---

## Architecture

```
Visitor → momdeals.org (Next.js on Vercel)
                │
                ▼
     ISR fetch every 5 min
                │
                ▼
   Cloudflare Tunnel  →  http://localhost:3003 (server.js)
                │
                ▼
         data/database.db
       (posts + amazon_products)
```

The Express server (`../server.js`) exposes three public read-only
endpoints used by this site:

- `GET /api/public/feed?page=&limit=&dealsOnly=&blogId=`
- `GET /api/public/products?page=&limit=&dealsOnly=&couponsOnly=`
- `GET /api/public/products/:asin`
- `GET /api/public/post/:id` (already existed, now also returns the joined `amazon_products` row)

---

## Local development

```bash
cd momdeals-site
npm install
cp .env.local.example .env.local
# Make sure the Express server is running on port 3003 (npm run dev in the parent folder)
npm run dev
# → http://localhost:3010
```

Required env vars (see `.env.local.example`):

| Variable                | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `MOMDEALS_API_BASE`     | Where to fetch from. `http://localhost:3003` for dev.    |
| `MOMDEALS_BLOG_ID`      | The blog ID (defaults to the Amazon Deals & Coupons one) |
| `NEXT_PUBLIC_SITE_URL`  | Used for canonical URLs, OG tags, sitemap                |
| `NEXT_PUBLIC_AMAZON_TAG`| Amazon Associates tag (defaults to `momsdeals07-20`)     |
| `REVALIDATE_SECRET`     | Shared secret for the on-demand revalidation webhook     |

---

## Deploying to Vercel (momdeals.org)

1. **Link the project** (run from inside `momdeals-site/`):

   ```bash
   npx vercel link
   npx vercel deploy --prod
   ```

2. **Set environment variables** in the Vercel dashboard
   (Project → Settings → Environment Variables):

   - `MOMDEALS_API_BASE` → `https://api.momdeals.org` (your Cloudflare tunnel URL)
   - `MOMDEALS_BLOG_ID` → `32a02390-f0a0-4639-9a98-8ed94b9fe4c8`
   - `NEXT_PUBLIC_SITE_URL` → `https://momdeals.org`
   - `NEXT_PUBLIC_AMAZON_TAG` → `momsdeals07-20`
   - `REVALIDATE_SECRET` → a long random string

3. **Add the domain** in Vercel → Domains:
   - `momdeals.org`
   - `www.momdeals.org` → redirect to apex

4. **Point DNS** (at your registrar / Cloudflare):
   - `A`     `@`    → `76.76.21.21` (Vercel)
   - `CNAME` `www`  → `cname.vercel-dns.com`
   - (Optional) `CNAME` `api` → your Cloudflare tunnel hostname

5. **Stable API URL.** The included `tunnel.js` uses a quick `trycloudflare.com`
   URL that rotates on restart. For production, create a **named tunnel** in
   the Cloudflare Zero Trust dashboard pointing `api.momdeals.org` →
   `http://localhost:3003`, then run `cloudflared tunnel run <name>`.

---

## On-demand revalidation

To bust the ISR cache when new content lands, hit:

```bash
curl "https://momdeals.org/api/revalidate?secret=<REVALIDATE_SECRET>&path=/"
```

Or POST a list of paths:

```bash
curl -X POST https://momdeals.org/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"<REVALIDATE_SECRET>","paths":["/","/deals","/products"]}'
```

Wire this into `scheduler.js` so the site updates instantly when the
autopilot publishes a new post.

---

## Routes

| Path                  | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `/`                   | Hero + chronological card feed (paginated, ISR 5 min)            |
| `/deals`              | Same feed filtered to active deals/coupons (sorted by deal score)|
| `/products`           | Grid of every scraped Amazon product, with filter chips          |
| `/product/[asin]`     | Auto-generated detail page per ASIN with JSON-LD Product schema  |
| `/post/[id]`          | Long-form blog post + featured-deal aside                        |
| `/go/[asin]`          | App-first → web Amazon redirect with affiliate tag               |
| `/about`, `/privacy`, `/disclosure` | Boilerplate pages                                  |
| `/api/revalidate`     | On-demand cache busting (GET or POST, requires secret)           |
| `/sitemap.xml`        | Auto-generated from feed + products                              |
| `/robots.txt`         | Allows indexing, blocks `/go/` and `/api/`                       |

---

## Stack

- Next.js 14 (App Router) + React 18
- TypeScript (strict)
- Tailwind CSS 3 with a warm coral / plum / sage palette
- Fraunces (display) + Inter (body) via `next/font`
- ISR with `revalidate = 300`
- JSON-LD `Product` schema on product pages

No client JavaScript beyond what Next.js ships by default — every page
renders on the server and ISR-caches.
