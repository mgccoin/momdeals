// Auto-generated "Best of" / comparison pages.
//
// Each roundup is a high-intent search target (e.g. "best air fryers",
// "best baby monitors"). The page is built automatically from the strongest
// products in the catalog (ranked by deal_score → review_count) that match the
// roundup's keywords, so the content refreshes itself as the deal finder runs.

export type Roundup = {
  /** URL slug → /best/<slug> */
  slug: string;
  /** Product noun, plural, Title Case. Used in the H1 and copy. */
  noun: string;
  /** Who it's for — appended to the H1, e.g. "for Moms". */
  audience: string;
  /** Short intro paragraph under the H1. */
  intro: string;
  /** Lowercase phrases matched against product titles (pipe-OR on the API). */
  keywords: string[];
  /** Lowercase phrases that disqualify a product (strips accessories/false-positives). */
  exclude?: string[];
  /** How many products to rank (3–30). */
  count: number;
};

export const ROUNDUPS: Roundup[] = [
  {
    slug: 'air-fryers',
    noun: 'Air Fryers',
    audience: 'for Moms',
    intro:
      'Air fryers are the busy-mom kitchen MVP — crispy dinners in minutes with little oil and almost no cleanup. We ranked the best Amazon air fryer deals right now by discount depth and verified reviews.',
    keywords: ['air fryer', 'airfryer'],
    exclude: ['sprayer', 'oil ', 'liner', 'parchment', 'rack', 'accessor', 'silicone', 'spray', 'disposable', 'magnetic', 'cheat sheet', 'cookbook', 'cover'],
    count: 10,
  },
  {
    slug: 'baby-monitors',
    noun: 'Baby Monitors',
    audience: '',
    intro:
      'A reliable baby monitor buys you peace of mind (and a little more sleep). These are the top-rated baby monitors on Amazon today, ranked by current deal and review count.',
    keywords: ['baby monitor', 'video monitor'],
    exclude: ['mount', 'holder', 'case', 'wall', 'shelf', 'stand for', 'bracket', 'cover'],
    count: 10,
  },
  {
    slug: 'strollers',
    noun: 'Strollers',
    audience: 'for Newborns & Toddlers',
    intro:
      'From lightweight travel strollers to all-terrain rides, here are the best stroller deals on Amazon right now — ranked by savings and parent reviews.',
    keywords: ['stroller', 'pushchair', 'pram', 'wagon stroller'],
    exclude: ['organizer', 'cover', 'hook', 'board', 'cup holder', 'fan', 'clip', 'liner', 'rain cover', 'net', 'caddy', 'phone holder', 'accessor'],
    count: 10,
  },
  {
    slug: 'car-seats',
    noun: 'Car Seats',
    audience: 'for Babies & Toddlers',
    intro:
      'The right car seat keeps your little one safe at every stage. We rounded up the best-rated convertible, infant, and booster car seat deals on Amazon today.',
    keywords: ['car seat', 'carseat', 'booster seat', 'infant seat'],
    exclude: ['cover', 'protector', 'mirror', 'organizer', 'canopy', 'strap', 'cushion', 'mat', 'travel bag', 'headrest', 'cup holder', 'accessor', 'liner'],
    count: 10,
  },
  {
    slug: 'pressure-cookers',
    noun: 'Pressure Cookers & Instant Pots',
    audience: 'for Moms',
    intro:
      'One-pot dinners, ready fast. These are the top multi-cooker, Instant Pot, and slow cooker deals on Amazon right now — ranked by discount and reviews.',
    keywords: ['pressure cooker', 'instant pot', 'multi cooker', 'multi-cooker', 'rice cooker', 'slow cooker', 'crock pot', 'crockpot'],
    exclude: ['liner', 'accessor', 'sealing ring', 'gasket', 'rack', 'glass lid', 'cookbook', 'silicone', 'steamer basket', 'replacement', 'cover', 'mat'],
    count: 10,
  },
  {
    slug: 'blenders',
    noun: 'Blenders',
    audience: 'for Smoothies & Baby Food',
    intro:
      'Whether it’s morning smoothies or homemade baby food, a good blender earns its counter space. Here are the best blender and food-processor deals on Amazon today.',
    keywords: ['blender', 'food processor', 'smoothie maker'],
    exclude: ['replacement', 'blade', 'gasket', 'jar', 'cup', 'bottle', 'accessor', 'lid', 'seal', 'spare'],
    count: 8,
  },
  {
    slug: 'pregnancy-pillows',
    noun: 'Pregnancy Pillows',
    audience: '',
    intro:
      'A great pregnancy pillow can be the difference between tossing all night and actually sleeping. These are the top-rated maternity and body pillow deals on Amazon now.',
    keywords: ['pregnancy pillow', 'maternity pillow', 'body pillow'],
    exclude: ['case only', 'cover only', 'replacement cover', 'pillowcase'],
    count: 8,
  },
  {
    slug: 'baby-carriers',
    noun: 'Baby Carriers',
    audience: '',
    intro:
      'Keep baby close and hands free. We ranked the best baby carrier, wrap, and sling deals on Amazon by comfort, reviews, and current price.',
    keywords: ['baby carrier', 'baby wrap', 'baby sling'],
    exclude: ['cover', 'accessor', 'teething pad', 'drool pad', 'replacement'],
    count: 8,
  },
  {
    slug: 'diaper-bags',
    noun: 'Diaper Bags',
    audience: '',
    intro:
      'Part backpack, part command center. These are the best-reviewed diaper bag deals on Amazon right now, ranked by savings and parent ratings.',
    keywords: ['diaper bag'],
    count: 8,
  },
  {
    slug: 'robot-vacuums',
    noun: 'Robot Vacuums',
    audience: 'for Busy Homes',
    intro:
      'Crumbs, pet hair, and toddler messes — handled while you do literally anything else. Here are the top robot vacuum deals on Amazon today.',
    keywords: ['robot vacuum', 'robot vac', 'robotic vacuum'],
    exclude: ['replacement', 'filter', 'accessor', 'brush', 'bag', 'mop pad', 'mop cloth', 'spare', 'parts kit'],
    count: 8,
  },
];

export function getRoundup(slug: string): Roundup | undefined {
  return ROUNDUPS.find((r) => r.slug === slug);
}

/** "Best Air Fryers for Moms (2026)" */
export function roundupHeading(r: Roundup, year = new Date().getFullYear()): string {
  return `Best ${r.noun}${r.audience ? ` ${r.audience}` : ''} (${year})`;
}

/** SEO <title>. */
export function roundupTitle(r: Roundup, year = new Date().getFullYear()): string {
  return `Best ${r.noun} ${year} — Top Amazon Deals${r.audience ? ` ${r.audience}` : ''}`;
}

export function roundupDescription(r: Roundup, year = new Date().getFullYear()): string {
  return `The best ${r.noun.toLowerCase()} on Amazon for ${year}${
    r.audience ? ` ${r.audience.toLowerCase()}` : ''
  }, ranked by current deal and verified reviews. Updated daily.`;
}
