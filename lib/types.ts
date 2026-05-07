export type Product = {
  id: string;
  asin: string;
  title: string;
  image_url: string;
  price: string;
  list_price: string;
  has_coupon: number;
  coupon_text: string;
  has_deal: number;
  deal_text: string;
  deal_score: number;
  review_count: number;
  affiliate_link: string;
  short_link: string;
  created_at: string;
  updated_at: string;
};

export type FeedItem = {
  id: string;             // post id
  blog_id: string;
  title: string;
  excerpt: string;
  image_url: string;
  tags: string;           // JSON-encoded array
  created_at: string;
  product_asin: string;
  product_price: string;

  ap_asin: string | null;
  ap_image: string | null;
  ap_price: string | null;
  ap_list_price: string | null;
  ap_has_coupon: number | null;
  ap_coupon_text: string | null;
  ap_has_deal: number | null;
  ap_deal_text: string | null;
  ap_deal_score: number | null;
  ap_short_link: string | null;
  ap_affiliate_link: string | null;
};

export type Post = {
  id: string;
  blog_id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  tags: string;
  created_at: string;
  product_asin?: string | null;
  product_price?: string | null;
  hook?: string | null;
  blog_name?: string | null;
  blog_niche?: string | null;
  product?: Product | null;
};

export type Paginated<T> = {
  items?: T[];
  products?: T[];
  posts?: T[];
  total: number;
  page: number;
  pages: number;
};
