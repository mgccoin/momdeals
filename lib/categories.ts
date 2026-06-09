// SEO hub/category pages. Targets the high-intent searches Search Console shows
// the site already appears for (e.g. "deals for moms", "mom deals", baby/kitchen).

export type Category = {
  slug: string;
  /** Page <h1>. */
  heading: string;
  /** <title> (the layout appends "· MomDeals"). */
  title: string;
  /** Meta description. */
  description: string;
  /** Intro paragraph shown under the H1. */
  intro: string;
  /** Lowercase keywords matched against a post's title/tags/excerpt. */
  keywords: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: 'moms',
    heading: 'Amazon Deals for Moms',
    title: 'Amazon Deals for Moms — Mom Deals Updated Daily',
    description:
      'Hand-picked Amazon deals for moms, updated daily. Mom-tested discounts and coupons on the kitchen, baby, and everyday essentials moms actually use.',
    intro:
      'The best Amazon deals for moms, refreshed every day. We hunt down mom-tested discounts and clipped coupons so you can grab the essentials for less — from the kitchen to the nursery.',
    keywords: ['mom', 'mama', 'mommy', 'mother', 'parent', 'family'],
  },
  {
    slug: 'baby',
    heading: 'Baby Deals & Newborn Essentials',
    title: 'Baby Deals & Newborn Essentials on Amazon',
    description:
      'Daily Amazon deals on baby and newborn essentials — strollers, carriers, monitors, nursery must-haves, and more, hand-picked and mom-tested.',
    intro:
      'Save on the baby gear that matters. These are today’s best Amazon deals on newborn and infant essentials — carriers, monitors, strollers, nursery picks, and the must-haves new parents swear by.',
    keywords: [
      'baby', 'newborn', 'infant', 'nursery', 'stroller', 'carrier',
      'monitor', 'diaper', 'crib', 'bottle', 'pacifier', 'swaddle',
    ],
  },
  {
    slug: 'kitchen',
    heading: 'Kitchen Gadget Deals',
    title: 'Kitchen Gadget Deals on Amazon — Updated Daily',
    description:
      'The best Amazon deals on kitchen gadgets and appliances — air fryers, blenders, cookware, and time-saving tools moms love. Updated daily.',
    intro:
      'Upgrade your kitchen for less. Here are today’s top Amazon deals on kitchen gadgets and small appliances — air fryers, blenders, cookware, and the clever tools that make cooking easier.',
    keywords: [
      'kitchen', 'air fryer', 'airfryer', 'blender', 'cookware', 'cooking',
      'appliance', 'pan', 'pot', 'knife', 'coffee', 'mixer', 'cutting board',
      'utensil', 'bakeware', 'instant pot',
    ],
  },
  {
    slug: 'pregnancy',
    heading: 'Pregnancy & Maternity Deals',
    title: 'Pregnancy & Maternity Deals on Amazon',
    description:
      'Amazon deals on pregnancy and maternity must-haves — nursing, postpartum recovery, maternity comfort, and newborn-prep essentials, updated daily.',
    intro:
      'Everything you need before and after baby arrives, for less. These Amazon deals cover pregnancy and maternity must-haves — nursing, postpartum recovery, and comfort essentials.',
    keywords: [
      'pregnancy', 'pregnant', 'maternity', 'nursing', 'postpartum',
      'breastfeeding', 'lactation', 'silverette', 'momcozy',
    ],
  },
  {
    slug: 'toddler',
    heading: 'Toddler & Kids Deals',
    title: 'Toddler & Kids Deals on Amazon — Updated Daily',
    description:
      'Daily Amazon deals on toddler and kids essentials — safety, mealtime, learning, and play picks that are mom-tested and budget-friendly.',
    intro:
      'Deals for the toddler years and beyond. Find today’s best Amazon discounts on kids’ safety, mealtime, learning, and play essentials — all mom-tested.',
    keywords: [
      'toddler', 'kids', 'child', 'children', 'baby proofing', 'cabinet lock',
      'safety', 'learning', 'playmat', 'sippy',
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** True if a post's text matches any of the category keywords. */
export function matchesCategory(
  cat: Category,
  item: { title?: string | null; tags?: string | null; excerpt?: string | null }
): boolean {
  const hay = `${item.title ?? ''} ${item.tags ?? ''} ${item.excerpt ?? ''}`.toLowerCase();
  return cat.keywords.some((k) => hay.includes(k));
}
