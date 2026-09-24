'use client';

import { useEffect, useState } from 'react';

type JobStatus = 'queued' | 'pulling' | 'linking' | 'generating' | 'posting' | 'done' | 'error';

type LinkResult = {
  input: string;
  asin: string | null;
  resolvedUrl: string | null;
  status: JobStatus;
  jobId: string | null;
  urlgeniusLink: string | null;
  goLink: string | null;
  affiliateUrl: string | null;
  title: string | null;
  image_url: string | null;
  inCatalog: boolean;
  willPublish: boolean;
  post: { id: string; title: string; created_at: string; webhook_status?: string } | null;
  postReused: boolean;
  socialStatus: string | null;
  error: string | null;
  note: string | null;
  /** Client-only: consecutive poll failures (transient API/gateway errors). */
  pollFailures?: number;
};

type ApiJob = {
  status?: JobStatus;
  urlgenius_link?: string | null;
  product?: { title?: string; image_url?: string } | null;
  post?: LinkResult['post'];
  post_reused?: boolean;
  social_status?: string | null;
  generate_error?: string | null;
  link_error?: string | null;
  error?: string | null;
  note?: string | null;
};

const STATUS_LABEL: Record<JobStatus, string> = {
  queued: 'Queued…',
  pulling: 'Reading the product on Amazon…',
  linking: 'Creating your Amazon deep link…',
  generating: 'Writing the post…',
  posting: 'Posting to Facebook/Instagram…',
  done: 'Ready',
  error: 'Failed',
};
const SETTLED = new Set<JobStatus>(['done', 'error']);
const MAX_PUBLISH = 3;
const POLL_MS = 3000;
/** Give up polling a row only after this many consecutive transient failures. */
const MAX_POLL_FAILURES = 8;

/** Clipboard write with a fallback for browsers that block the async API. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function CopyButton({
  text,
  label = 'Copy',
  primary = false,
}: {
  text: string;
  label?: string;
  primary?: boolean;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function onClick() {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    setTimeout(() => setState('idle'), 1500);
  }
  const cls = primary
    ? 'btn-coral shrink-0 px-3 py-1.5 text-xs'
    : 'shrink-0 rounded-xl border border-plum-200 px-3 py-1.5 text-xs font-semibold text-plum-500 hover:border-coral-300 hover:text-coral-600';
  return (
    <button type="button" onClick={onClick} className={cls} aria-live="polite">
      {state === 'copied' ? 'Copied!' : state === 'failed' ? 'Select & copy' : label}
    </button>
  );
}

function LinkRow({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
        primary ? 'border border-coral-200 bg-coral-50' : 'bg-plum-50/60'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-plum-400">{label}</div>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className={`block truncate font-mono text-xs ${primary ? 'font-bold text-coral-700' : 'text-plum-700'}`}
        >
          {value}
        </a>
      </div>
      <CopyButton text={value} primary={primary} />
    </div>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  const cls =
    status === 'done'
      ? 'bg-sage-100 text-sage-700'
      : status === 'error'
        ? 'bg-coral-50 text-coral-700'
        : 'bg-plum-50 text-plum-600 animate-pulse';
  return <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>{STATUS_LABEL[status]}</span>;
}

/** Merge a polled job record into a result row. */
function mergeJob(r: LinkResult, job: ApiJob): LinkResult {
  return {
    ...r,
    status: job.status || r.status,
    urlgeniusLink: job.urlgenius_link ?? r.urlgeniusLink,
    title: job.product?.title || r.title,
    image_url: job.product?.image_url || r.image_url,
    inCatalog: r.inCatalog || Boolean(job.product?.title),
    post: job.post ?? r.post,
    postReused: Boolean(job.post_reused),
    socialStatus: job.social_status ?? r.socialStatus,
    error: job.error || job.link_error || job.generate_error || null,
    note: job.note ?? r.note,
  };
}

export default function LinkGenerator({ adminKey }: { adminKey: string }) {
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LinkResult[]>([]);

  const lines = input
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const publishTooMany = publish && lines.length > MAX_PUBLISH;

  // Poll unfinished background jobs every few seconds until they settle.
  useEffect(() => {
    const pending = results.filter((r) => r.jobId && !SETTLED.has(r.status));
    if (pending.length === 0) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const updates = await Promise.all(
        pending.map(async (r) => {
          try {
            const res = await fetch(
              `/api/admin/deeplink?key=${encodeURIComponent(adminKey)}&job=${encodeURIComponent(r.jobId as string)}`,
              { cache: 'no-store' },
            );
            const job = (await res.json().catch(() => ({}))) as ApiJob;
            if (!res.ok) {
              // Only a missing job or a bad key is final. Gateway/timeout errors
              // are transient: the API is probably just busy inside Chromium.
              if (res.status === 404 || res.status === 401) {
                const msg =
                  job.error === 'job_not_found'
                    ? 'Lost track of this job (the API restarted). Run it again.'
                    : job.error || `API error ${res.status}`;
                return { jobId: r.jobId, job: { status: 'error' as JobStatus, error: msg } as ApiJob, transient: false };
              }
              return { jobId: r.jobId, job: null as ApiJob | null, transient: true };
            }
            return { jobId: r.jobId, job, transient: false };
          } catch {
            return { jobId: r.jobId, job: null as ApiJob | null, transient: true };
          }
        }),
      );
      if (cancelled) return;
      setResults((prev) =>
        prev.map((r) => {
          const u = updates.find((x) => x && x.jobId === r.jobId);
          if (!u) return r;
          if (u.transient || !u.job) {
            const failures = (r.pollFailures || 0) + 1;
            if (failures >= MAX_POLL_FAILURES) {
              return {
                ...r,
                pollFailures: failures,
                status: 'error' as JobStatus,
                error:
                  'Lost contact with the API while this was still running. Refresh in a minute and run it again; it will pick up the finished link.',
              };
            }
            return { ...r, pollFailures: failures };
          }
          return mergeJob({ ...r, pollFailures: 0 }, u.job);
        }),
      );
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [results, adminKey]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError('Paste at least one Amazon link.');
      return;
    }
    if (publishTooMany) {
      setError(`Publishing is limited to ${MAX_PUBLISH} links at a time. Uncheck "publish" or paste fewer links.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/deeplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKey, urls: lines, publish }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setResults([]);
      } else {
        setResults(Array.isArray(data.results) ? data.results : []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleClear() {
    setInput('');
    setResults([]);
    setError(null);
  }

  const ready = results.filter((r) => r.urlgeniusLink);
  const inProgress = results.filter((r) => !SETTLED.has(r.status)).length;
  const allDeepLinks = ready.map((r) => r.urlgeniusLink).join('\n');

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      {/* Input */}
      <div className="min-w-0 rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-plum-800">Paste Amazon links</h2>
        <p className="mt-1 text-sm text-plum-500">
          One per line. Works with any Amazon product URL, amzn.to / a.co short links, URLgenius links, or a bare
          ASIN. Each becomes the product&apos;s Amazon deep link, which opens the Amazon app on phones with your
          tag. If the product doesn&apos;t have one yet, it&apos;s created for you (takes up to a minute).
        </p>
        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-plum-400">Amazon links</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder={'https://www.amazon.com/dp/B0…\nhttps://amzn.to/…\nB0XXXXXXXX'}
              className="mt-1.5 w-full rounded-2xl border border-plum-200 px-4 py-3 font-mono text-sm text-plum-800 outline-none focus:border-coral-400"
            />
          </div>

          <label className="flex items-start gap-2.5 rounded-2xl border border-plum-100 bg-plum-50/40 px-4 py-3 text-sm text-plum-700">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-plum-300 text-coral-500"
            />
            <span>
              <span className="font-semibold">Also publish as a post on the site + Facebook/Instagram</span>
              <span className="mt-0.5 block text-xs text-plum-500">
                Adds the product to the site, writes a post about it now, and sends it to social through your Zap.
                Up to {MAX_PUBLISH} links per run. If the product already has a post, that post is reused instead
                of writing a duplicate.
              </span>
            </span>
          </label>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-plum-400">
              {lines.length} link{lines.length === 1 ? '' : 's'}
              {publishTooMany ? (
                <span className="ml-2 text-coral-600">· publishing allows {MAX_PUBLISH} at a time</span>
              ) : null}
            </span>
            <div className="flex gap-2">
              {input ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-xl border border-plum-200 px-3 py-2 text-xs font-semibold text-plum-500 hover:border-coral-300 hover:text-coral-600"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="submit"
                disabled={busy || lines.length === 0 || publishTooMany}
                className="btn-coral px-5 py-2.5 disabled:opacity-60"
              >
                {busy ? 'Starting…' : publish ? 'Generate & publish' : 'Generate deep links'}
              </button>
            </div>
          </div>
        </form>
        {error ? <p className="mt-4 rounded-2xl bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</p> : null}
      </div>

      {/* Results */}
      <div className="min-w-0 rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-plum-800">Your deep links</h2>
            <p className="mt-1 text-sm text-plum-500">
              {results.length === 0
                ? 'Results appear here.'
                : `${ready.length} of ${results.length} ready${inProgress ? ` · ${inProgress} in progress` : ''}.`}
            </p>
          </div>
          {ready.length > 1 ? <CopyButton text={allDeepLinks} label={`Copy all ${ready.length}`} primary /> : null}
        </div>

        {results.length === 0 ? (
          <p className="mt-6 text-sm text-plum-400">Paste a link on the left and tap Generate.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {results.map((r, i) => (
              <div key={`${r.input}-${i}`} className="rounded-2xl border border-plum-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-plum-50">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" className="h-full w-full object-contain p-1" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold text-plum-800">
                      {r.title || r.asin || r.input}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-plum-400">
                      {r.asin ? (
                        <span className="rounded-md bg-sage-100 px-1.5 py-0.5 font-mono font-bold text-sage-700">
                          {r.asin}
                        </span>
                      ) : null}
                      {r.asin ? <StatusPill status={r.status} /> : null}
                      {r.asin && r.inCatalog ? <span className="text-sage-600">in catalog</span> : null}
                      {r.resolvedUrl ? <span>short link expanded</span> : null}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-plum-300">{r.input}</div>
                  </div>
                </div>

                {r.error ? (
                  <p className="mt-3 rounded-2xl bg-coral-50 px-3 py-2 text-xs text-coral-700">{r.error}</p>
                ) : null}
                {r.note ? <p className="mt-3 text-xs text-plum-500">{r.note}</p> : null}

                {r.asin ? (
                  <div className="mt-3 space-y-2">
                    {r.urlgeniusLink ? (
                      <LinkRow label="Amazon deep link · opens the Amazon app" value={r.urlgeniusLink} primary />
                    ) : !SETTLED.has(r.status) ? (
                      <div className="rounded-2xl border border-dashed border-coral-200 bg-coral-50/50 px-3 py-2 text-xs text-coral-700">
                        {STATUS_LABEL[r.status]} Your Amazon deep link will appear here.
                      </div>
                    ) : null}
                    {r.goLink ? (
                      <LinkRow label="Site link · momdeals.org/go (sends visitors to the deep link)" value={r.goLink} />
                    ) : null}
                    {r.affiliateUrl ? <LinkRow label="Plain Amazon affiliate link" value={r.affiliateUrl} /> : null}
                  </div>
                ) : null}

                {r.willPublish ? (
                  <div className="mt-3 rounded-2xl bg-plum-50/60 px-3 py-2 text-xs text-plum-700">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-plum-400">Post</div>
                    {r.post ? (
                      <div className="mt-0.5">
                        <span className="font-semibold">{r.post.title}</span>
                        {r.postReused ? <span className="text-plum-500"> · existing post reused</span> : null}
                        {r.socialStatus ? <div className="mt-0.5 text-plum-600">Social: {r.socialStatus}</div> : null}
                      </div>
                    ) : !SETTLED.has(r.status) ? (
                      <div className="mt-0.5 text-plum-500">{STATUS_LABEL[r.status]}</div>
                    ) : (
                      <div className="mt-0.5 text-plum-500">No post was created.</div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
