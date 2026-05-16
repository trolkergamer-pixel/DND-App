// NextTurn — combat tracker arcade-medieval
// Primitives, palettes, icons, logo.

const { useState, useEffect, useRef, useMemo } = React;

// ───────────────────────────────────────────────────────────
// GLOBAL ANIMATIONS / FONT SMOOTHING (inject once)
// ───────────────────────────────────────────────────────────
(function injectGlobalCSS() {
  if (document.getElementById('nt-anim-styles')) return;
  const s = document.createElement('style');
  s.id = 'nt-anim-styles';
  s.textContent = `
    @keyframes ntScreenIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .nt-screen { animation: ntScreenIn 0.32s cubic-bezier(0.16, 1, 0.3, 1); height: 100%; display: flex; flex-direction: column; }

    @keyframes ntItemIn {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .nt-item { animation: ntItemIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }

    @keyframes ntPop {
      0%   { transform: scale(0.85); opacity: 0; }
      60%  { transform: scale(1.04); opacity: 1; }
      100% { transform: scale(1); }
    }
    .nt-pop { animation: ntPop 0.36s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @keyframes ntPulse {
      0%, 100% { filter: drop-shadow(0 0 4px var(--glow, transparent)); }
      50%      { filter: drop-shadow(0 0 14px var(--glow, transparent)); }
    }
    .nt-glow { animation: ntPulse 2.8s ease-in-out infinite; }

    @keyframes ntShake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-3px); }
      40% { transform: translateX(3px); }
      60% { transform: translateX(-2px); }
      80% { transform: translateX(2px); }
    }
    .nt-shake { animation: ntShake 0.4s ease-in-out; }

    @keyframes ntFlash {
      0% { background-color: var(--flash, rgba(255,255,255,0.5)); }
      100% { background-color: transparent; }
    }

    .nt-btn { transition: transform 0.08s ease, background 0.15s ease, box-shadow 0.15s ease; }
    .nt-btn:active { transform: translateY(2px) scale(0.985); }

    .nt-fade-in { animation: ntScreenIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
  `;
  document.head.appendChild(s);
})();

// ───────────────────────────────────────────────────────────
// PALETTES
// ───────────────────────────────────────────────────────────
// Each palette declares a `darkest` shadow color (used by the sword logo) so
// light themes don't end up with bg-colored shadows on the blade.
const PALETTES = {
  forja: {
    name: 'Forja Oscura',
    bg: '#15110d', bg2: '#1f1812', panel: '#2a1f18', panelHi: '#3a2c22',
    line: '#5a4632', ink: '#e8d5a8', inkDim: '#a89878',
    gold: '#d4a24c', goldHi: '#f0c060',
    blood: '#a83232', bloodHi: '#d04848',
    green: '#7a9a3e',
    darkest: '#06030200', // dark for sword shadow
  },
  pergamino: {
    name: 'Pergamino',
    bg: '#ece1c4', bg2: '#e2d6b3', panel: '#f3ead2', panelHi: '#ddcfa6',
    line: '#7a6a47', ink: '#1a1612', inkDim: '#5a4a32',
    gold: '#8b6a22', goldHi: '#a8842e',
    blood: '#8b2233', bloodHi: '#a83248',
    green: '#3a5a22',
    darkest: '#1a1612',
  },
  hierro: {
    name: 'Hierro Antiguo',
    bg: '#1c2128', bg2: '#252b34', panel: '#2d343f', panelHi: '#3a4250',
    line: '#5a6478', ink: '#cdd2da', inkDim: '#8a93a4',
    gold: '#c47a4a', goldHi: '#dc9460',
    blood: '#a04848', bloodHi: '#c46868',
    green: '#6a9a7a',
    darkest: '#0a0d12',
  },
  sangre: {
    name: 'Sangre Real',
    // Brighter inkDim and a richer ink/gold pair for high contrast on the warm-black bg
    bg: '#0e0606', bg2: '#180c0c', panel: '#241616', panelHi: '#321c1c',
    line: '#6a3030', ink: '#f8f0e6', inkDim: '#c4a8a0',
    gold: '#f4ead8', goldHi: '#ffffff',
    blood: '#e83a4a', bloodHi: '#ff6070',
    green: '#86b048',
    darkest: '#06020200',
  },
  marfil: {
    // Revert to original all-crimson on cream — but keep `darkest` so the sword logo's
    // grooves and shadows render in dark ink (not cream) for proper depth.
    name: 'Marfil',
    bg: '#ece4d0', bg2: '#e0d6bc', panel: '#f6f0de', panelHi: '#d8ccae',
    line: '#5a4a32', ink: '#1a1410', inkDim: '#5a4a3a',
    gold: '#7a1f26', goldHi: '#9c2a32',
    blood: '#7a1f26', bloodHi: '#9c2a32',
    green: '#3a5a2a',
    darkest: '#14100c',
  },
  obsidiana: {
    // Brighter inkDim for legibility on pure black
    name: 'Obsidiana',
    bg: '#070707', bg2: '#101010', panel: '#1a1a1a', panelHi: '#262626',
    line: '#4a4a4a', ink: '#f4f4f4', inkDim: '#bcbcbc',
    gold: '#f4f0e6', goldHi: '#ffffff',
    blood: '#e02030', bloodHi: '#ff4858',
    green: '#7aa848',
    darkest: '#000000',
  },
};

// ───────────────────────────────────────────────────────────
// BESTIARY — original generic creatures (not WotC-specific stat blocks)
// ───────────────────────────────────────────────────────────
const BESTIARY = [
  { name: 'Trasgo',          hp: 5,   ca: 13, glyph: 'tr' },
  { name: 'Goblin',          hp: 7,   ca: 15, glyph: 'go' },
  { name: 'Bandido',         hp: 11,  ca: 12, glyph: 'ba' },
  { name: 'Esqueleto',       hp: 13,  ca: 13, glyph: 'es' },
  { name: 'Orco',            hp: 15,  ca: 13, glyph: 'or' },
  { name: 'Zombi',           hp: 22,  ca: 8,  glyph: 'zo' },
  { name: 'Lobo Huargo',     hp: 26,  ca: 13, glyph: 'lh' },
  { name: 'Hobgoblin',       hp: 11,  ca: 18, glyph: 'hb' },
  { name: 'Gnoll',           hp: 22,  ca: 15, glyph: 'gn' },
  { name: 'Ogro',            hp: 59,  ca: 11, glyph: 'og' },
  { name: 'Troll',           hp: 84,  ca: 15, glyph: 'tl' },
  { name: 'Mantícora',       hp: 68,  ca: 14, glyph: 'mc' },
  { name: 'Gólem de Piedra', hp: 178, ca: 17, glyph: 'gp' },
  { name: 'Liche',           hp: 135, ca: 17, glyph: 'li' },
  { name: 'Dragón Rojo',     hp: 178, ca: 18, glyph: 'dr' },
  { name: 'Beholder',        hp: 180, ca: 18, glyph: 'be' },
];

// ───────────────────────────────────────────────────────────
// LOGO — bigger crossed swords, more detail, designed to bleed past its frame
// ───────────────────────────────────────────────────────────
const SwordsLogo = ({ size = 200, color = '#d4a24c', accent = '#f0c060', dark = '#0a0807' }) => {
  // One vertical sword from y=8 (tip) to y=88 (pommel)
  const Sword = () => (
    <g>
      {/* blade body */}
      <polygon points="48,10 52,10 52,54 48,54" fill={color}/>
      {/* tip */}
      <polygon points="48,10 52,10 50,3" fill={color}/>
      <polygon points="48,10 50,3 49,10" fill={accent}/>
      {/* highlight edge */}
      <rect x="48" y="11" width="1" height="42" fill={accent} opacity="0.7"/>
      {/* fuller (groove) */}
      <rect x="49.5" y="13" width="1" height="38" fill={dark} opacity="0.45"/>
      {/* shadow edge */}
      <rect x="51" y="11" width="1" height="42" fill={dark} opacity="0.3"/>

      {/* crossguard - flared */}
      <polygon points="33,55 67,55 64,61 36,61" fill={color}/>
      <polygon points="33,55 67,55 65,57 35,57" fill={accent}/>
      {/* guard quillon tips */}
      <polygon points="33,55 30,57 33,61" fill={color}/>
      <polygon points="67,55 70,57 67,61" fill={color}/>
      {/* guard rivet */}
      <rect x="48" y="56" width="4" height="4" fill={dark} opacity="0.5"/>

      {/* grip */}
      <rect x="46" y="61" width="8" height="18" fill={color}/>
      <rect x="46" y="61" width="2" height="18" fill={accent}/>
      <rect x="52" y="61" width="2" height="18" fill={dark} opacity="0.35"/>
      {/* leather wrap stripes */}
      <rect x="46" y="64" width="8" height="1.5" fill={dark} opacity="0.5"/>
      <rect x="46" y="68" width="8" height="1.5" fill={dark} opacity="0.5"/>
      <rect x="46" y="72" width="8" height="1.5" fill={dark} opacity="0.5"/>
      <rect x="46" y="76" width="8" height="1.5" fill={dark} opacity="0.5"/>

      {/* pommel - diamond */}
      <polygon points="50,79 56,85 50,91 44,85" fill={color}/>
      <polygon points="50,81 54,85 50,89 46,85" fill={accent}/>
      <rect x="49" y="84" width="2" height="2" fill={dark}/>
    </g>
  );

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <filter id="ntsword-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.2" floodColor={dark} floodOpacity="0.6"/>
        </filter>
      </defs>
      <g filter="url(#ntsword-shadow)">
        <g transform="rotate(-32 50 50)"><Sword/></g>
        <g transform="rotate(32 50 50)"><Sword/></g>
      </g>
      {/* center rivet */}
      <rect x="47" y="47" width="6" height="6" fill={accent} transform="rotate(45 50 50)"/>
      <rect x="48.5" y="48.5" width="3" height="3" fill={dark} transform="rotate(45 50 50)"/>
    </svg>
  );
};

// Small inline swords (used in headers/buttons)
const Swords = ({ size = 24, color = '#d4a24c' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
    <g transform="rotate(45 16 16)">
      <rect x="15" y="3" width="2" height="19" fill={color}/>
      <rect x="12" y="20" width="8" height="2" fill={color}/>
      <rect x="15" y="22" width="2" height="4" fill={color}/>
      <polygon points="15,3 16,1 17,3" fill={color}/>
    </g>
    <g transform="rotate(-45 16 16)">
      <rect x="15" y="3" width="2" height="19" fill={color}/>
      <rect x="12" y="20" width="8" height="2" fill={color}/>
      <rect x="15" y="22" width="2" height="4" fill={color}/>
      <polygon points="15,3 16,1 17,3" fill={color}/>
    </g>
  </svg>
);

// ───────────────────────────────────────────────────────────
// ICONS — basic shapes only
// ───────────────────────────────────────────────────────────
const HeartIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M8 14 L2 8 L2 5 L5 2 L8 5 L11 2 L14 5 L14 8 Z" fill={color}/>
  </svg>
);

const ShieldIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M8 1 L14 3 L14 9 L8 15 L2 9 L2 3 Z" fill="none" stroke={color} strokeWidth="1.6"/>
  </svg>
);

const SkullIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <rect x="3" y="2" width="10" height="9" fill={color}/>
    <rect x="5" y="11" width="6" height="2" fill={color}/>
    <rect x="6" y="13" width="4" height="1" fill={color}/>
    <rect x="5" y="5"  width="2" height="2" fill="#000"/>
    <rect x="9" y="5"  width="2" height="2" fill="#000"/>
    <rect x="7" y="8"  width="2" height="2" fill="#000"/>
  </svg>
);

const CrownIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 20 16">
    <polygon points="2,14 18,14 17,6 14,9 10,3 6,9 3,6" fill={color}/>
    <rect x="2" y="14" width="16" height="2" fill={color}/>
    <rect x="3" y="6"  width="2" height="2" fill={color}/>
    <rect x="9" y="3"  width="2" height="2" fill={color}/>
    <rect x="15" y="6" width="2" height="2" fill={color}/>
  </svg>
);

const BannerIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <rect x="3" y="2" width="10" height="10" fill={color}/>
    <polygon points="3,12 8,9 13,12 13,14 8,11 3,14" fill={color}/>
    <rect x="6" y="4" width="4" height="4" fill="#000" opacity="0.3"/>
  </svg>
);

const D20 = ({ size = 32, color, spin }) => (
  <svg width={size} height={size} viewBox="0 0 32 32"
       style={{ display: 'block', transition: 'transform 0.6s', transform: spin ? 'rotate(720deg)' : 'rotate(0)' }}>
    <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none" stroke={color} strokeWidth="2"/>
    <polygon points="16,2 30,10 16,16 2,10" fill="none" stroke={color} strokeWidth="1.2" opacity="0.6"/>
    <polygon points="16,16 30,10 30,22 16,30" fill="none" stroke={color} strokeWidth="1.2" opacity="0.6"/>
    <polygon points="16,16 2,10 2,22 16,30" fill="none" stroke={color} strokeWidth="1.2" opacity="0.6"/>
  </svg>
);

const RestIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path d="M11 3 a5 5 0 1 0 2 5 a4 4 0 0 1 -2 -5 z" fill={color}/>
    <rect x="2" y="2" width="2" height="2" fill={color}/>
    <rect x="5" y="5" width="1.5" height="1.5" fill={color}/>
  </svg>
);

const PlusIcon = ({ size = 16, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <rect x="7" y="2" width="2" height="12" fill={color}/>
    <rect x="2" y="7" width="12" height="2" fill={color}/>
  </svg>
);

const StarIcon = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" fill={color}/>
  </svg>
);

// ───────────────────────────────────────────────────────────
// PRIMITIVES
// ───────────────────────────────────────────────────────────
function PixelButton({ children, onClick, variant = 'gold', size = 'md', full, disabled, palette }) {
  const p = palette;
  const colors = {
    gold:  { bg: p.gold,  bgHi: p.goldHi,  fg: p.bg },
    blood: { bg: p.blood, bgHi: p.bloodHi, fg: '#fff' },
    ghost: { bg: 'transparent', bgHi: p.panelHi, fg: p.ink, border: p.line },
    dark:  { bg: p.panel, bgHi: p.panelHi, fg: p.ink, border: p.line },
    green: { bg: p.green, bgHi: p.green, fg: p.bg },
  }[variant];
  const sizes = { sm: { py: 8,  px: 12, fs: 8  }, md: { py: 12, px: 16, fs: 10 }, lg: { py: 16, px: 20, fs: 11 } }[size];
  return (
    <button
      onClick={disabled ? null : onClick}
      disabled={disabled}
      className="nt-btn"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: sizes.fs, lineHeight: 1.4, letterSpacing: 1,
        padding: `${sizes.py}px ${sizes.px}px`,
        background: colors.bg,
        color: colors.fg,
        border: 'none',
        outline: colors.border ? `2px solid ${colors.border}` : 'none',
        outlineOffset: -2,
        width: full ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        boxShadow: `inset 0 -4px 0 rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.10)`,
        textTransform: 'uppercase',
      }}
    >{children}</button>
  );
}

function PixelInput({ value, onChange, placeholder, type = 'text', max, palette, align }) {
  const p = palette;
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={max}
      style={{
        fontFamily: '"VT323", monospace',
        fontSize: 22, lineHeight: 1, letterSpacing: 1,
        padding: '10px 12px',
        background: p.bg2,
        color: p.ink,
        border: 'none',
        outline: `2px solid ${p.line}`,
        outlineOffset: -2,
        width: '100%',
        boxSizing: 'border-box',
        textAlign: align || 'left',
      }}
    />
  );
}

function SectionFrame({ children, palette, style, accent }) {
  const p = palette;
  const cornerColor = accent || p.gold;
  return (
    <div style={{
      background: p.panel,
      outline: `2px solid ${p.line}`,
      outlineOffset: -2,
      padding: 14,
      position: 'relative',
      ...style,
    }}>
      {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i) => (
        <div key={i} style={{
          position: 'absolute', width: 6, height: 6, background: cornerColor,
          left: x ? 'auto' : -2, right: x ? -2 : 'auto',
          top:  y ? 'auto' : -2, bottom: y ? -2 : 'auto',
        }}/>
      ))}
      {children}
    </div>
  );
}

function H({ children, palette, size = 14, color }) {
  return <div style={{
    fontFamily: '"Press Start 2P", monospace',
    fontSize: size, letterSpacing: 1.5,
    color: color || palette.gold, textTransform: 'uppercase',
  }}>{children}</div>;
}

function Sub({ children, palette }) {
  return <div style={{
    fontFamily: '"VT323", monospace', fontSize: 18, letterSpacing: 1,
    color: palette.inkDim, textTransform: 'uppercase',
  }}>{children}</div>;
}

function Cinzel({ children, palette, size = 18, color }) {
  return <div style={{
    fontFamily: '"Cinzel", serif', fontSize: size, fontWeight: 600,
    color: color || palette.ink, letterSpacing: 1.5,
  }}>{children}</div>;
}

function HPBar({ current, max, palette, color }) {
  const pct = Math.max(0, Math.min(1, current / max));
  const c = color || (pct > 0.6 ? palette.green : pct > 0.3 ? palette.gold : palette.blood);
  return (
    <div style={{ background: palette.bg, height: 10, position: 'relative', outline: `1px solid ${palette.line}`, outlineOffset: -1 }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: c, transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}/>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 7px, rgba(0,0,0,0.25) 7px 8px)`, pointerEvents: 'none' }}/>
    </div>
  );
}

Object.assign(window, {
  PixelButton, PixelInput, SectionFrame, H, Sub, Cinzel, HPBar,
  Swords, SwordsLogo, D20, HeartIcon, ShieldIcon, SkullIcon, CrownIcon, BannerIcon, RestIcon, PlusIcon, StarIcon,
  PALETTES, BESTIARY,
});
