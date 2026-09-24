'use client';

import { useState } from 'react';

type LinkResult = {
  input: string;
  asin: string | null;
  resolvedUrl: string | null;
  deepLink: string | null;
  affiliateUrl: string | null;
  appUrl: string | null;
  urlgeniusLink: string | null;
  title: string | null;
  image_url: string | null;
  inCatalog: boolean;
  error: string | null;
};

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

export default function LinkGenerator({ adminKey }: { adminKey: string }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LinkResult[]>([]);

  const lines = input
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError('Paste at least one Amazon link.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/deeplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKey, urls: lines }),
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

  const ready = results.filter((r) => r.deepLink);
  const allDeepLinks = ready.map((r) => r.deepLink).join('\n');

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      {/* Input */}
      <div className="min-w-0 rounded-3xl border border-plum-100 bg-white p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-plum-800">Paste Amazon links</h2>
        <p className="mt-1 text-sm text-plum-500">
          One per line. Works with any Amazon product URL, amzn.to / a.co short links, or a bare ASIN. Each
          becomes a <span className="font-mono">momdeals.org/go/…</span> deep link that opens the Amazon app on
          phones and always carries your affiliate tag.
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
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-plum-400">
              {lines.length} link{lines.length === 1 ? '' : 's'}
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
                disabled={busy || lines.length === 0}
                className="btn-coral px-5 py-2.5 disabled:opacity-60"
              >
                {busy ? 'Generating…' : 'Generate deep links'}
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
              {results.length === 0 ? 'Results appear here.' : `${ready.length} of ${results.length} ready.`}
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
                      {r.asin ? (
                        r.inCatalog ? (
                          <span className="text-sage-600">in catalog</span>
                        ) : (
                          <span>not in catalog yet · link still works</span>
                        )
                      ) : null}
                      {r.resolvedUrl ? <span>short link expanded</span> : null}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-plum-300">{r.input}</div>
                  </div>
                </div>

                {r.error ? (
                  <p className="mt-3 rounded-2xl bg-coral-50 px-3 py-2 text-xs text-coral-700">{r.error}</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {r.deepLink ? (
                      <LinkRow label="Deep link · opens the Amazon app" value={r.deepLink} primary />
                    ) : null}
                    {r.urlgeniusLink ? (
                      <LinkRow label="URLgenius link · the deep link redirects here" value={r.urlgeniusLink} />
                    ) : null}
                    {r.affiliateUrl ? <LinkRow label="Plain Amazon affiliate link" value={r.affiliateUrl} /> : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
