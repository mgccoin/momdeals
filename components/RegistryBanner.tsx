const REGISTRY_URL = 'https://urlgeni.us/amzn/KHBk1S';

/**
 * Site-wide banner promoting the (free) Amazon Baby Registry.
 * Pure server component — a plain anchor, same handoff behavior as DealLink:
 * the URLgenius deep link opens the Amazon app when installed.
 */
export function RegistryBanner() {
  return (
    <a
      href={REGISTRY_URL}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="group block bg-gradient-to-r from-plum-600 via-plum-500 to-coral-600 text-white"
    >
      <div className="container-site flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2.5 md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </span>
          <p className="text-sm font-semibold md:text-[15px]">
            Expecting? Open an Amazon Baby Registry — <span className="font-black text-coral-200">100% FREE</span>
            <span className="hidden lg:inline text-white/80 font-normal"> · welcome gift, completion discount &amp; 365-day returns</span>
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-coral-600 shadow-card transition group-hover:bg-coral-50 group-hover:shadow-cardHover">
          Start yours free
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </a>
  );
}
