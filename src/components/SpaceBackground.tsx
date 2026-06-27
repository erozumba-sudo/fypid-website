// Deterministic star field using golden-ratio distribution (avoids Math.random rerender flicker)
const GOLDEN = 137.508;

function makeStar(i: number) {
  const x = ((i * GOLDEN) % 100);
  const y = ((i * 97.31) % 100);
  const sz = i % 7 === 0 ? 2.5 : i % 4 === 0 ? 1.8 : i % 3 === 0 ? 1.4 : 1.0;
  const delay = ((i * 0.41) % 5).toFixed(2);
  const dur   = (2.5 + (i % 4) * 0.8).toFixed(1);
  const op    = (0.2 + (i % 6) * 0.08).toFixed(2);
  const slow  = i % 5 === 0;
  // Slightly tint some stars blue or warm
  const tint  = i % 11 === 0 ? '#a8d8ff' : i % 9 === 0 ? '#ffd580' : '#ffffff';
  return { x, y, sz, delay, dur, op, slow, tint };
}

const STARS = Array.from({ length: 110 }, (_, i) => makeStar(i));

// Shooting stars — static positions so they don't flicker on render
const SHOOTERS = [
  { top: '12%', left: '8%',  delay: '3s',  dur: '1.8s', angle: 38, cls: 'shooting-star' },
  { top: '28%', left: '55%', delay: '11s', dur: '1.4s', angle: 42, cls: 'shooting-star-2' },
  { top: '6%',  left: '72%', delay: '19s', dur: '2s',   angle: 35, cls: 'shooting-star' },
  { top: '45%', left: '22%', delay: '27s', dur: '1.6s', angle: 40, cls: 'shooting-star-2' },
];

interface MoonProps {
  className?: string;
}

export function Moon({ className = '' }: MoonProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`moon-animate select-none pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="moonGrad" cx="35%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#f5e6c0" />
          <stop offset="30%"  stopColor="#d4a84b" />
          <stop offset="65%"  stopColor="#8b6914" />
          <stop offset="100%" stopColor="#1a1206" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <filter id="moonBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <clipPath id="moonClip">
          <circle cx="100" cy="100" r="88" />
        </clipPath>
      </defs>

      {/* Outer glow halo */}
      <circle cx="100" cy="100" r="98" fill="url(#moonGlow)" />

      {/* Moon surface */}
      <circle cx="100" cy="100" r="88" fill="url(#moonGrad)" />

      {/* Craters */}
      <g clipPath="url(#moonClip)" filter="url(#moonBlur)">
        <circle cx="72"  cy="78"  r="11" fill="#7a5a18" opacity="0.55" />
        <circle cx="130" cy="55"  r="7"  fill="#6b4e12" opacity="0.45" />
        <circle cx="115" cy="130" r="14" fill="#7a5a18" opacity="0.50" />
        <circle cx="52"  cy="125" r="8"  fill="#5e4210" opacity="0.40" />
        <circle cx="148" cy="105" r="6"  fill="#7a5a18" opacity="0.35" />
        <circle cx="85"  cy="150" r="5"  fill="#6b4e12" opacity="0.35" />
        {/* Highlight rims */}
        <circle cx="70"  cy="76"  r="11" fill="none" stroke="#f0d070" strokeWidth="1.5" opacity="0.18" />
        <circle cx="130" cy="54"  r="7"  fill="none" stroke="#f0d070" strokeWidth="1"   opacity="0.15" />
        <circle cx="115" cy="129" r="14" fill="none" stroke="#f0d070" strokeWidth="1.5" opacity="0.15" />
      </g>

      {/* Terminator shadow overlay */}
      <ellipse cx="140" cy="100" rx="70" ry="88" fill="#0B0C10" opacity="0.38" clipPath="url(#moonClip)" />

      {/* Specular highlight */}
      <ellipse cx="75" cy="68" rx="22" ry="14" fill="white" opacity="0.09" transform="rotate(-20 75 68)" />
    </svg>
  );
}

interface PlanetRingsProps {
  className?: string;
  color?: string;
}

export function PlanetWithRings({ className = '', color = '#4B0082' }: PlanetRingsProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={`select-none pointer-events-none ${className}`}
      style={{ animation: 'float-planet 10s ease-in-out infinite' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="planetGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#9b59b6" />
          <stop offset="50%"  stopColor={color} />
          <stop offset="100%" stopColor="#1a0030" />
        </radialGradient>
        <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#9b59b6" stopOpacity="0.0" />
          <stop offset="35%"  stopColor="#D4AF37" stopOpacity="0.35" />
          <stop offset="60%"  stopColor="#9b59b6" stopOpacity="0.55" />
          <stop offset="85%"  stopColor="#D4AF37" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#9b59b6" stopOpacity="0.0" />
        </radialGradient>
        <filter id="planetGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Back ring */}
      <ellipse cx="80" cy="60" rx="68" ry="14" fill="none" stroke="url(#ringGrad)" strokeWidth="8" opacity="0.5" />
      {/* Planet body */}
      <circle cx="80" cy="60" r="36" fill="url(#planetGrad)" filter="url(#planetGlow)" />
      {/* Atmosphere glow */}
      <circle cx="80" cy="60" r="38" fill="none" stroke="#9b59b6" strokeWidth="3" opacity="0.25" />
      {/* Band */}
      <ellipse cx="80" cy="64" rx="36" ry="6" fill="#6a0dad" opacity="0.30" clipPath="url(#planetBodyClip)" />
      {/* Highlight */}
      <ellipse cx="66" cy="50" rx="12" ry="8" fill="white" opacity="0.10" transform="rotate(-20 66 50)" />
      {/* Front ring */}
      <ellipse cx="80" cy="60" rx="68" ry="14" fill="none" stroke="url(#ringGrad)" strokeWidth="5" opacity="0.65"
        style={{ clipPath: 'inset(50% 0 0 0)' }} />
    </svg>
  );
}

interface ConstellationProps {
  className?: string;
}

export function Constellation({ className = '' }: ConstellationProps) {
  // A simple Orion-like constellation pattern
  const stars = [
    { x: 30, y: 20 }, { x: 70, y: 15 }, { x: 110, y: 25 },
    { x: 50, y: 55 }, { x: 90, y: 50 },
    { x: 35, y: 90 }, { x: 60, y: 80 }, { x: 100, y: 85 }, { x: 125, y: 95 },
  ];
  const lines = [
    [0,1],[1,2],[0,3],[1,4],[2,4],[3,4],[3,5],[4,7],[5,6],[6,7],[7,8]
  ];
  return (
    <svg viewBox="0 0 160 120" className={`select-none pointer-events-none ${className}`}>
      <g opacity="0.15">
        {lines.map(([a, b], i) => (
          <line
            key={i}
            x1={stars[a].x} y1={stars[a].y}
            x2={stars[b].x} y2={stars[b].y}
            stroke="#D4AF37" strokeWidth="0.7"
          />
        ))}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="2" fill="#D4AF37" opacity="0.8" />
        ))}
      </g>
    </svg>
  );
}

interface SpaceBackgroundProps {
  /** Number of stars to render */
  count?: number;
  showShooters?: boolean;
}

export default function SpaceBackground({ count = 110, showShooters = true }: SpaceBackgroundProps) {
  const stars = STARS.slice(0, Math.min(count, STARS.length));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Stars */}
      {stars.map(s => (
        <div
          key={s.tint + s.x + s.y}
          className={s.slow ? 'star-twinkle-slow' : 'star-twinkle'}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.sz,
            height: s.sz,
            borderRadius: '50%',
            backgroundColor: s.tint,
            '--star-opacity': s.op,
            '--duration': `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            opacity: parseFloat(s.op),
            boxShadow: s.sz > 2 ? `0 0 ${s.sz * 2}px ${s.tint}` : 'none',
          } as React.CSSProperties}
        />
      ))}

      {/* Shooting stars */}
      {showShooters && SHOOTERS.map((sh, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: sh.top,
            left: sh.left,
            width: 3,
            height: 1.5,
            background: 'linear-gradient(90deg, white, transparent)',
            borderRadius: 2,
            transform: `rotate(${sh.angle}deg)`,
            animation: `${sh.cls} ${sh.dur} linear ${sh.delay} infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
