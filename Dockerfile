# MomDeals — Next.js website Docker image (deployed to Fly.io as `momdeals`)
# Multi-stage build using Next.js standalone output for a tiny final image.

ARG NODE_VERSION=20

# ── Stage 1: install deps ────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build (needs MOMDEALS_API_BASE at build time for ISR fetches) ──
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Inject build-time vars from Fly secrets / fly deploy --build-arg
ARG MOMDEALS_API_BASE
ARG MOMDEALS_BLOG_ID
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_AMAZON_TAG
ENV MOMDEALS_API_BASE=$MOMDEALS_API_BASE \
    MOMDEALS_BLOG_ID=$MOMDEALS_BLOG_ID \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_AMAZON_TAG=$NEXT_PUBLIC_AMAZON_TAG \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: tiny runtime image ──────────────────────────────────────────────
FROM node:${NODE_VERSION}-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Security: run as non-root
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs
# Standalone output — only the bits Next.js needs to run
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
