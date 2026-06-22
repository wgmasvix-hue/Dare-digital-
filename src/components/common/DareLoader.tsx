import { useEffect, useState } from 'react';

interface Props { onDone?: () => void; }

export default function DareLoader({ onDone }: Props) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(() => onDone?.(), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#0D1F17',
      opacity: phase === 'exit' ? 0 : 1,
      transform: phase === 'exit' ? 'scale(1.03)' : 'scale(1)',
      transition: 'opacity 0.55s ease, transform 0.55s ease',
      pointerEvents: phase === 'exit' ? 'none' : 'all',
    }}>
      <style>{`
        /* ── Ndebele grid overlay ── */
        .dl-bg {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            repeating-linear-gradient(45deg,  rgba(217,119,6,0.035) 0, rgba(217,119,6,0.035) 1px, transparent 0, transparent 30px),
            repeating-linear-gradient(-45deg, rgba(194,65,12,0.025) 0, rgba(194,65,12,0.025) 1px, transparent 0, transparent 30px);
        }

        /* ── Baobab corner silhouette ── */
        .dl-baobab { position:absolute; bottom:0; right:5%; opacity:0.035; pointer-events:none; }

        /* ── Book scene ── */
        .dl-scene { width:220px; height:170px; perspective:700px; position:relative; }

        /* spine */
        .dl-spine {
          position:absolute; left:50%; top:8px;
          transform:translateX(-50%);
          width:14px; height:140px;
          background:linear-gradient(180deg,#14532D,#166534,#15803D);
          border-radius:3px;
          box-shadow:0 0 18px rgba(22,101,52,0.55), inset 0 0 6px rgba(0,0,0,0.3);
          z-index:6;
        }
        .dl-spine::after {
          content:'';
          position:absolute; inset:0;
          background:repeating-linear-gradient(180deg,
            transparent 0, transparent 7px,
            rgba(217,119,6,0.55) 7px, rgba(217,119,6,0.55) 9px,
            transparent 9px, transparent 16px,
            rgba(194,65,12,0.45) 16px, rgba(194,65,12,0.45) 18px
          );
          border-radius:3px;
        }

        /* left page */
        .dl-page-left {
          position:absolute; left:14px; top:6px;
          width:88px; height:142px;
          background:linear-gradient(160deg,#FDE68A 0%,#FEF3C7 100%);
          border-radius:4px 0 0 4px;
          transform-origin:right center;
          transform:rotateY(24deg);
          box-shadow:-5px 6px 24px rgba(0,0,0,0.4);
          overflow:hidden;
        }
        .dl-page-left::before {
          content:'';
          position:absolute; inset:16px 12px;
          background:repeating-linear-gradient(180deg,
            transparent 0,transparent 9px,
            rgba(22,101,52,0.22) 9px,rgba(22,101,52,0.22) 11px
          );
        }
        .dl-page-left::after {
          content:'D';
          position:absolute; top:14px; left:50%; transform:translateX(-50%);
          font-size:32px; font-weight:900; color:rgba(22,101,52,0.15);
          font-family:'Bricolage Grotesque',sans-serif;
        }

        /* right page */
        .dl-page-right {
          position:absolute; right:14px; top:6px;
          width:88px; height:142px;
          background:linear-gradient(220deg,#FFFBF0 0%,#FEF9EE 100%);
          border-radius:0 4px 4px 0;
          transform-origin:left center;
          transform:rotateY(-24deg);
          box-shadow:5px 6px 24px rgba(0,0,0,0.35);
          overflow:hidden;
        }
        .dl-page-right::before {
          content:'';
          position:absolute; inset:16px 12px;
          background:repeating-linear-gradient(180deg,
            transparent 0,transparent 9px,
            rgba(194,65,12,0.18) 9px,rgba(194,65,12,0.18) 11px
          );
        }

        /* flipping page */
        .dl-flip {
          position:absolute; right:14px; top:6px;
          width:88px; height:142px;
          transform-origin:left center;
          transform-style:preserve-3d;
          animation:dlFlip 1.7s cubic-bezier(0.4,0,0.2,1) infinite;
          z-index:5;
        }
        .dl-flip-f, .dl-flip-b {
          position:absolute; inset:0;
          border-radius:0 4px 4px 0;
          backface-visibility:hidden;
        }
        .dl-flip-f {
          background:linear-gradient(160deg,#FBBF24 0%,#FDE68A 60%,#FEF3C7 100%);
          box-shadow:5px 0 14px rgba(0,0,0,0.25);
        }
        .dl-flip-f::before {
          content:'';
          position:absolute; inset:16px 12px;
          background:repeating-linear-gradient(180deg,
            transparent 0,transparent 9px,
            rgba(217,119,6,0.28) 9px,rgba(217,119,6,0.28) 11px
          );
        }
        .dl-flip-b {
          background:linear-gradient(160deg,#FEF3C7 0%,#FFFBF0 100%);
          transform:rotateY(180deg);
          border-radius:4px 0 0 4px;
        }

        @keyframes dlFlip {
          0%   { transform:rotateY(0deg);     box-shadow:5px 8px 30px rgba(0,0,0,0.3); }
          45%  { transform:rotateY(-88deg);   box-shadow:0  16px 40px rgba(0,0,0,0.5); }
          75%  { transform:rotateY(-172deg);  box-shadow:-3px 8px 20px rgba(0,0,0,0.25); }
          100% { transform:rotateY(-180deg);  box-shadow:-3px 6px 16px rgba(0,0,0,0.2); }
        }

        /* ── Particles ── */
        .dl-particle {
          position:absolute;
          border-radius:50%;
          opacity:0;
          animation:dlFloat var(--dur,1.8s) ease-out infinite;
          animation-delay:var(--delay,0s);
        }
        @keyframes dlFloat {
          0%   { transform:translateY(0) scale(1);   opacity:0; }
          12%  { opacity:0.9; }
          75%  { opacity:0.5; }
          100% { transform:translateY(-80px) scale(0.3); opacity:0; }
        }

        /* ── Logo entrance ── */
        .dl-logo   { animation:dlFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        .dl-sub    { animation:dlFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.7s both; }
        .dl-bar    { animation:dlFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.9s both; }
        .dl-badge  { animation:dlFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 1.1s both; }
        @keyframes dlFadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ── Progress fill ── */
        .dl-fill {
          height:100%;
          background:repeating-linear-gradient(90deg,
            #166534 0,#166534 18px,#D97706 18px,#D97706 36px,
            #C2410C 36px,#C2410C 54px,#1C1917 54px,#1C1917 72px
          );
          background-size:200px 4px;
          border-radius:2px;
          animation:dlProgress 2.6s cubic-bezier(0.15,0,0.4,1) 0.4s both;
        }
        @keyframes dlProgress {
          from { width:0%; }
          to   { width:100%; }
        }

        /* ── Shimmer sweep on fill ── */
        .dl-fill::after {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.35) 50%,transparent 100%);
          animation:dlShimmer 1.4s ease infinite 0.6s;
        }
        @keyframes dlShimmer {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(400%); }
        }
      `}</style>

      {/* Ndebele overlay */}
      <div className="dl-bg" />

      {/* Baobab silhouette */}
      <svg className="dl-baobab" width="200" height="240" viewBox="0 0 200 240">
        <rect x="88" y="140" width="24" height="100" fill="#FEF9EE" rx="5"/>
        <ellipse cx="100" cy="125" rx="70" ry="48" fill="#FEF9EE"/>
        <ellipse cx="42" cy="104" rx="40" ry="28" fill="#FEF9EE"/>
        <ellipse cx="158" cy="104" rx="40" ry="28" fill="#FEF9EE"/>
        <ellipse cx="62" cy="76"  rx="28" ry="22" fill="#FEF9EE"/>
        <ellipse cx="138" cy="76" rx="28" ry="22" fill="#FEF9EE"/>
        <ellipse cx="100" cy="64" rx="32" ry="24" fill="#FEF9EE"/>
      </svg>

      {/* ── Animated book ── */}
      <div style={{ position: 'relative', marginBottom: 44 }}>
        <div className="dl-scene">
          <div className="dl-page-left" />
          <div className="dl-page-right" />
          <div className="dl-flip">
            <div className="dl-flip-f" />
            <div className="dl-flip-b" />
          </div>
          <div className="dl-spine" />
        </div>

        {/* Knowledge particles */}
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, height: 0 }}>
          {[
            { x: 42, size: 4, color: '#D97706', delay: '0s',    dur: '1.7s' },
            { x: 56, size: 3, color: '#166534', delay: '0.22s', dur: '2.0s' },
            { x: 48, size: 5, color: '#FCD34D', delay: '0.45s', dur: '1.5s' },
            { x: 38, size: 3, color: '#C2410C', delay: '0.65s', dur: '1.9s' },
            { x: 62, size: 4, color: '#FFFBF0', delay: '0.82s', dur: '1.6s' },
            { x: 52, size: 3, color: '#D97706', delay: '1.05s', dur: '2.1s' },
            { x: 44, size: 4, color: '#166534', delay: '1.25s', dur: '1.8s' },
            { x: 58, size: 3, color: '#FCD34D', delay: '1.4s',  dur: '1.5s' },
          ].map((p, i) => (
            <div key={i} className="dl-particle" style={{
              width: p.size, height: p.size, background: p.color,
              left: `${p.x}%`, bottom: 0,
              '--delay': p.delay, '--dur': p.dur,
            } as React.CSSProperties} />
          ))}
        </div>
      </div>

      {/* ── Branding ── */}
      <div className="dl-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
          <path d="M16 2 L30 8 L30 22 Q30 32 16 35 Q2 32 2 22 L2 8 Z" fill="#166534" stroke="#D97706" strokeWidth="1.5"/>
          <text x="16" y="24" textAnchor="middle" fill="#FCD34D" fontSize="14" fontWeight="900" fontFamily="Bricolage Grotesque, sans-serif">D</text>
        </svg>
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 900, fontSize: 22, letterSpacing: '0.1em', color: '#FCD34D', textTransform: 'uppercase' }}>
          DARE Digital
        </span>
      </div>

      <p className="dl-sub" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(254,243,199,0.45)', textTransform: 'uppercase', marginBottom: 28 }}>
        Zimbabwe's Open Education Platform
      </p>

      {/* ── Kente progress bar ── */}
      <div className="dl-bar" style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', position: 'relative', marginBottom: 20 }}>
        <div className="dl-fill" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 2, overflow: 'hidden' }} />
      </div>

      {/* BAKO badge */}
      <div className="dl-badge" style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.4 }}>
        <span style={{ fontSize: 14 }}>🌳</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: '#D97706', textTransform: 'uppercase' }}>
          BAKO AI powered
        </span>
      </div>
    </div>
  );
}
