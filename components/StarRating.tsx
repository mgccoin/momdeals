type Props = {
  /** 0–5 rating. */
  rating: number;
  reviewCount?: number;
  className?: string;
};

/** Visible star rating that matches the AggregateRating JSON-LD on the page. */
export function StarRating({ rating, reviewCount, className }: Props) {
  if (!rating || rating <= 0) return null;
  const rounded = Math.round(rating * 2) / 2; // nearest half
  const full = Math.floor(rounded);
  const half = rounded - full === 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="flex text-coral-500" aria-hidden>
        {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} fill />)}
        {half && <Star half />}
        {Array.from({ length: empty }).map((_, i) => <Star key={`e${i}`} />)}
      </span>
      <span className="text-sm font-semibold text-plum-700">{rating.toFixed(1)}</span>
      {reviewCount ? (
        <span className="text-xs text-plum-400">({reviewCount.toLocaleString()})</span>
      ) : null}
    </div>
  );
}

/**
 * Social proof for cards: shows the star rating when we have one, otherwise
 * falls back to a single star + review count (so proof shows even before the
 * average rating is backfilled). Renders nothing when there's no signal.
 */
export function SocialProof({
  rating,
  reviewCount,
  className,
}: {
  rating?: number | null;
  reviewCount?: number | null;
  className?: string;
}) {
  if (rating && rating > 0) {
    return <StarRating rating={rating} reviewCount={reviewCount ?? undefined} className={className} />;
  }
  if (reviewCount && reviewCount > 0) {
    return (
      <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
        <span className="flex text-coral-500" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} fill />)}
        </span>
        <span className="text-xs font-semibold text-plum-600">
          {reviewCount.toLocaleString()} ratings
        </span>
      </div>
    );
  }
  return null;
}

function Star({ fill, half }: { fill?: boolean; half?: boolean }) {
  const id = `half-${Math.random().toString(36).slice(2)}`;
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      {half && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.77l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z"
        fill={half ? `url(#${id})` : fill ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
