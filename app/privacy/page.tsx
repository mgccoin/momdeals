import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Privacy policy for ${SITE_NAME}.`,
};

export default function PrivacyPage() {
  return (
    <article className="container-site max-w-prose py-14">
      <h1 className="font-display text-4xl font-black text-plum-800">Privacy Policy</h1>
      <div className="prose-mom mt-6">
        <p>
          {SITE_NAME} respects your privacy. This page summarizes what we collect and why.
        </p>
        <h2>What we collect</h2>
        <p>
          We do not require you to create an account, and we do not collect personal
          information directly. Standard server logs (IP address, browser type, referrer)
          may be recorded for security and analytics.
        </p>
        <h2>Affiliate cookies</h2>
        <p>
          When you click a "Get this deal" link, Amazon may set a cookie that allows them
          to attribute any resulting purchase to {SITE_NAME}. This is how affiliate
          programs work and is governed by Amazon's privacy policy.
        </p>
        <h2>Third-party services</h2>
        <p>
          We may use Vercel for hosting and analytics, and Amazon for affiliate links.
          Each of those services has its own privacy policy.
        </p>
        <h2>Contact</h2>
        <p>
          If you have privacy questions, reply to any email from us or use the contact
          information at the bottom of this page.
        </p>
      </div>
    </article>
  );
}
