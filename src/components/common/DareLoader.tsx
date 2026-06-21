import { useEffect, useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   DARE Digital Library — Animated Book Splash Screen
   Shows for ~2.8 s on first mount, then fades out.
   ───────────────────────────────────────────────────────────────────────── */

interface Props {
  onDone?: () => void;
}

export default function DareLoader({ onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 2600);
    const t3 = setTimeout(() => onDone?.(), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  /* ── floating knowledge particles ── */
  const particles = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: 38 + Math.sin(i * 1.3) * 28,
    delay: i * 0.18,
    size: 3 + (i % 3),
    color: ['#D97706', '#166534', '#C2410C', '#FFFBF0', '#FCD34D'][i % 5],
  }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0D1F17',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      <style>{`
        /* ── Faint ndebele grid overlay ── */
        .dare-loader-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            repeating-linear-gradient(45deg, rgba(217,119,6,0.04) 0, rgba(217,119,6,0.04) 1px, transparent 0, transparent 28px),
            repeating-linear-gradient(-45deg, rgba(194,65,12,0.03) 0, rgba(194,65,12,0.03) 1px, transparent 0, transparent 28px);
        }

        /* ── Book 3-D container ── */
        .dare-book-scene {
          width: 200px; height: 160px;
          perspective: 600px;
          position: relative;
        }

        /* ── Spine ── */
        .dare-spine {
          position: absolute; left: 50%; top: 10px;
          transform: translateX(-50%);
          width: 12px; height: 130px;
          background: linear-gradient(180deg, #14532D 0%, #166534 40%, #15803D 100%);
          border-radius: 2px;
          box-shadow: 0 0 12px rgba(22,101,52,0.6);
          z-index: 5;
        }
        /* kente stripe on spine */
        .dare-spine::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(180deg,
            transparent 0px, transparent 8px,
            rgba(217,119,6,0.5) 8px, rgba(217,119,6,0.5) 10px,
            transparent 10px, transparent 18px,
            rgba(194,65,12,0.4) 18px, rgba(194,65,12,0.4) 20px
          );
          border-radius: 2px;
        }

        /* ── Left page (static) ── */
        .dare-page-left {
          position: absolute; left: 16px; top: 8px;
          width: 82px; height: 132px;
          background: linear-gradient(135deg, #FEF9EE 0%, #FDE68A 100%);
          border-radius: 3px 0 0 3px;
          transform-origin: right center;
          transform: rotateY(22deg);
          box-shadow: -4px 4px 20px rgba(0,0,0,0.35);
          overflow: hidden;
        }
        /* text lines on left page */
        .dare-page-left::before {
          content: '';
          position: absolute; inset: 14px 10px;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px, transparent 9px,
            rgba(22,101,52,0.25) 9px, rgba(22,101,52,0.25) 11px
          );
        }
        /* DARE shield icon on left page */
        .dare-page-left::after {
          content: 'D';
          position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
          font-size: 28px; font-weight: 900; color: rgba(22,101,52,0.18);
          font-family: 'Bricolage Grotesque', sans-serif;
          line-height: 1;
        }

        /* ── Right page (static) ── */
        .dare-page-right {
          position: absolute; right: 16px; top: 8px;
          width: 82px; height: 132px;
          background: linear-gradient(225deg, #FEF9EE 0%, #FFFBF0 100%);
          border-radius: 0 3px 3px 0;
          transform-origin: left center;
          transform: rotateY(-22deg);
          box-shadow: 4px 4px 20px rgba(0,0,0,0.30);
          overflow: hidden;
        }
        .dare-page-right::before {
          content: '';
          position: absolute; inset: 14px 10px;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px, transparent 9px,
            rgba(194,65,12,0.2) 9px, rgba(194,65,12,0.2) 11px
          );
        }

        /* ── Turning page ── */
        .dare-page-turn {
          position: absolute; right: 16px; top: 8px;
          width: 82px; height: 132px;
          transform-origin: left center;
          transform-style: preserve-3d;
          animation: darePageFlip 1.6s ease-in-out infinite;
          z-index: 4;
        }
        .dare-page-turn-front {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, #FDE68A 0%, #FEF3C7 100%);
          border-radius: 0 3px 3px 0;
          backface-visibility: hidden;
          box-shadow: 4px 0 10px rgba(0,0,0,0.2);
        }
        .dare-page-turn-front::before {
          content: '';
          position: absolute; inset: 14px 10px;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px, transparent 9px,
            rgba(217,119,6,0.3) 9px, rgba(217,119,6,0.3) 11px
          );
        }
        .dare-page-turn-back {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, #FEF3C7 0%, #FFFBF0 100%);
          border-radius: 3px 0 0 3px;
          backface-visibility: hidden;
          transform: rotateY(180deg);
          box-shadow: -4px 0 10px rgba(0,0,0,0.15);
        }

        @keyframes darePageFlip {
          0%   { transform: rotateY(0deg); }
          40%  { transform: rotateY(-90deg); box-shadow: 0 8px 32px rgba(0,0,0,0.45); }
          70%  { transform: rotateY(-170deg); }
          85%  { transform: rotateY(-180deg); }
          100% { transform: rotateY(-180deg); }
        }

        /* ── Knowledge particles ── */
        .dare-particle {
          position: absolute;
          border-radius: 50%;
          animation: dareFloat 1.8s ease-out infinite;
          opacity: 0;
        }
        @keyframes dareFloat {
          0%   { transform: translateY(0) scale(1);   opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateY(-70px) scale(0.4); opacity: 0; }
        }

        /* ── Text fade-in ── */
        .dare-title {
          animation: dareFadeUp 0.6s ease 0.5s both;
        }
        .dare-sub {
          animation: dareFadeUp 0.6s ease 0.75s both;
        }
        @keyframes dareFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Kente progress bar ── */
        .dare-progress-track {
          width: 200px; height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
          animation: dareFadeUp 0.6s ease 1s both;
        }
        .dare-progress-fill {
          height: 100%;
          background: repeating-linear-gradient(90deg,
            #166534 0px, #166534 16px,
            #D97706 16px, #D97706 32px,
            #C2410C 32px, #C2410C 48px,
            #1C1917 48px, #1C1917 64px
          );
          background-size: 200px 4px;
          border-radius: 2px;
          animation: dareProgress 2.4s cubic-bezier(0.2,0,0.4,1) 0.3s both;
        }
        @keyframes dareProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ── Baobab silhouette ── */
        .dare-baobab {
          position: absolute; bottom: 0; right: 40px;
          opacity: 0.04; pointer-events: none;
        }
      `}</style>

      {/* Ndebele grid overlay */}
      <div className="dare-loader-bg" />

      {/* Faint baobab silhouette */}
      <svg className="dare-baobab" width="160" height="200" viewBox="0 0 160 200">
        <rect x="72" y="120" width="16" height="80" fill="#FEF9EE" rx="4"/>
        <ellipse cx="80" cy="105" rx="55" ry="40" fill="#FEF9EE"/>
        <ellipse cx="38" cy="90" rx="30" ry="22" fill="#FEF9EE"/>
        <ellipse cx="122" cy="90" rx="30" ry="22" fill="#FEF9EE"/>
        <ellipse cx="55" cy="68" rx="22" ry="18" fill="#FEF9EE"/>
        <ellipse cx="105" cy="68" rx="22" ry="18" fill="#FEF9EE"/>
        <ellipse cx="80" cy="58" rx="26" ry="20" fill="#FEF9EE"/>
      </svg>

      {/* ── Animated Book ── */}
      <div style={{ position: 'relative', marginBottom: 40 }}>
        <div className="dare-book-scene">
          {/* Left page */}
          <div className="dare-page-left" />
          {/* Right page (static back) */}
          <div className="dare-page-right" />
          {/* Flipping page */}
          <div className="dare-page-turn">
            <div className="dare-page-turn-front" />
            <div className="dare-page-turn-back" />
          </div>
          {/* Spine */}
          <div className="dare-spine" />
        </div>

        {/* Knowledge particles rising from book */}
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, height: 0 }}>
          {particles.map(p => (
            <div
              key={p.id}
              className="dare-particle"
              style={{
                width: p.size, height: p.size,
                background: p.color,
                left: `${p.x}%`,
                bottom: 0,
                animationDelay: `${p.delay}s`,
                animationDuration: `${1.4 + (p.id % 3) * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Branding ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="dare-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          {/* DARE shield logo */}
          <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
            <path d="M16 2 L30 8 L30 20 Q30 30 16 34 Q2 30 2 20 L2 8 Z" fill="#166534" stroke="#D97706" strokeWidth="1.5"/>
            <text x="16" y="23" textAnchor="middle" fill="#FCD34D" fontSize="13" fontWeight="900" fontFamily="Bricolage Grotesque, sans-serif">D</text>
          </svg>
          <span style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: '0.12em',
            color: '#FCD34D',
            textTransform: 'uppercase',
          }}>DARE Digital</span>
        </div>
        <p className="dare-sub" style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: 'rgba(254,243,199,0.55)',
          textTransform: 'uppercase',
        }}>
          Zimbabwe's Open Education Platform
        </p>
      </div>

      {/* ── Kente progress bar ── */}
      <div className="dare-progress-track">
        <div className="dare-progress-fill" />
      </div>

      {/* BAKO AI badge */}
      <div style={{
        marginTop: 20,
        display: 'flex', alignItems: 'center', gap: 6,
        opacity: 0.45,
        animation: 'dareFadeUp 0.6s ease 1.2s both',
      }}>
        <span style={{ fontSize: 14 }}>🌳</span>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: 10,
          fontWeight: 700, letterSpacing: '0.14em',
          color: '#D97706', textTransform: 'uppercase',
        }}>BAKO AI powered</span>
      </div>
    </div>
  );
}
