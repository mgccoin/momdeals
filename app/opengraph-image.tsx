import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/config';

export const runtime = 'edge';
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background:
            'linear-gradient(135deg, #FFF1EC 0%, #FFE3DA 45%, #F8D6E5 100%)',
          fontFamily: 'system-ui, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, #FF8A78 0%, #F26554 60%, transparent 70%)',
            opacity: 0.25,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -120,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, #A684B8 0%, #5B3A6E 70%, transparent 75%)',
            opacity: 0.18,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background:
                'linear-gradient(135deg, #FF8A78 0%, #F26554 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 18px 40px rgba(242,101,84,0.35)',
            }}
          >
            <svg
              width="58"
              height="58"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M48.84 18.61a8.25 8.25 0 0 0-11.67 0L32 23.78l-5.17-5.17a8.25 8.25 0 1 0-11.67 11.67L32 47.12l16.84-16.84a8.25 8.25 0 0 0 0-11.67Z"
                fill="#FFF8F3"
              />
            </svg>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: -1.5,
              color: '#3E1F4F',
            }}
          >
            <span>Mom</span>
            <span style={{ color: '#F26554' }}>Deals</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '10px 22px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(242,101,84,0.25)',
              color: '#F26554',
              fontSize: 22,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Amazon deals & coupons
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: 86,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: -2,
              color: '#3E1F4F',
              maxWidth: 900,
            }}
          >
            <span>Smart deals,&nbsp;</span>
            <span style={{ color: '#F26554' }}>mom-tested</span>
            <span>&nbsp;daily.</span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#5B3A6E',
              maxWidth: 880,
              lineHeight: 1.35,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#5B3A6E',
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#7CB689',
              }}
            />
            Hand-picked daily
          </div>
          <div style={{ opacity: 0.7 }}>momdeals.org</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
