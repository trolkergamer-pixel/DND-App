// NextTurn — dice roller (D4/D6/D8/D10/D12/D20)
// Optional utility; doesn't affect game state.

const { useState: ud, useEffect: ued, useRef: udr } = React;

// ───────────────────────────────────────────────────────────
// Inject dice animation styles once
// ───────────────────────────────────────────────────────────
(function injectDiceCSS() {
  if (document.getElementById('nt-dice-styles')) return;
  const s = document.createElement('style');
  s.id = 'nt-dice-styles';
  s.textContent = `
    @keyframes ntDieTumble {
      0%   { transform: rotateX(0deg)   rotateY(0deg)   rotateZ(0deg)   scale(0.7); }
      20%  { transform: rotateX(180deg) rotateY(90deg)  rotateZ(-45deg) scale(1.05); }
      40%  { transform: rotateX(360deg) rotateY(270deg) rotateZ(120deg) scale(0.95); }
      60%  { transform: rotateX(540deg) rotateY(450deg) rotateZ(225deg) scale(1.08); }
      80%  { transform: rotateX(720deg) rotateY(630deg) rotateZ(300deg) scale(0.96); }
      100% { transform: rotateX(720deg) rotateY(720deg) rotateZ(360deg) scale(1); }
    }
    .nt-die-stage   { perspective: 600px; }
    .nt-die-3d      { transform-style: preserve-3d; will-change: transform; }
    .nt-die-tumble  { animation: ntDieTumble 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes ntDieBounce {
      0%   { transform: translateY(-12px) scale(0.85); opacity: 0; }
      60%  { transform: translateY(2px)   scale(1.08); opacity: 1; }
      100% { transform: translateY(0)     scale(1);    opacity: 1; }
    }
    .nt-die-bounce { animation: ntDieBounce 0.36s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @keyframes ntDieGlow {
      0%, 100% { filter: drop-shadow(0 0 4px var(--die-glow, transparent)); }
      50%      { filter: drop-shadow(0 2px 10px var(--die-glow, transparent)); }
    }
    .nt-die-result { animation: ntDieGlow 2.4s ease-in-out infinite; }

    @keyframes ntCritFlash {
      0%   { transform: scale(0.6); opacity: 0; }
      40%  { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1);   opacity: 1; }
    }
    .nt-crit { animation: ntCritFlash 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
  `;
  document.head.appendChild(s);
})();

// ───────────────────────────────────────────────────────────
// DICE ICONS — distinctive polyhedron silhouettes
// ───────────────────────────────────────────────────────────
function DieShape({ type, size = 56, color, accent, dark, value, showValue, big }) {
  const s = size;
  const stroke = Math.max(1.5, s / 28);
  const fs = big ? Math.floor(s * 0.36) : Math.floor(s * 0.42);

  const shapes = {
    4: ( // tetrahedron — equilateral with inner edge
      <g>
        <polygon points="50,8 92,82 8,82" fill={accent} stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
        <polygon points="50,8 92,82 50,62" fill={color} opacity="0.55"/>
        <line x1="50" y1="8" x2="50" y2="82" stroke={dark} strokeWidth={stroke * 0.6} opacity="0.5"/>
      </g>
    ),
    6: ( // isometric cube
      <g>
        <polygon points="50,8 88,28 88,72 50,92 12,72 12,28" fill={accent} stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
        <polygon points="50,8 88,28 50,48 12,28" fill={color} opacity="0.7"/>
        <polygon points="88,28 88,72 50,92 50,48" fill={dark} opacity="0.35"/>
        <line x1="50" y1="48" x2="50" y2="92" stroke={dark} strokeWidth={stroke * 0.6} opacity="0.4"/>
      </g>
    ),
    8: ( // octahedron — vertical bipyramid
      <g>
        <polygon points="50,6 90,50 50,94 10,50" fill={accent} stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
        <line x1="10" y1="50" x2="90" y2="50" stroke={color} strokeWidth={stroke * 0.7}/>
        <polygon points="50,6 90,50 50,50" fill={color} opacity="0.55"/>
        <polygon points="50,50 90,50 50,94" fill={dark} opacity="0.4"/>
      </g>
    ),
    10: ( // pentagonal trapezohedron — kite shape
      <g>
        <polygon points="50,6 86,38 70,72 30,72 14,38" fill={accent} stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
        <polygon points="50,6 86,38 50,50 14,38" fill={color} opacity="0.65"/>
        <polygon points="14,38 50,50 30,72" fill={dark} opacity="0.3"/>
        <polygon points="86,38 50,50 70,72" fill={dark} opacity="0.45"/>
        <polygon points="30,72 50,50 70,72 50,94" fill={dark} opacity="0.6"/>
        <line x1="14" y1="38" x2="50" y2="50" stroke={color} strokeWidth={stroke * 0.5} opacity="0.7"/>
        <line x1="86" y1="38" x2="50" y2="50" stroke={color} strokeWidth={stroke * 0.5} opacity="0.7"/>
      </g>
    ),
    12: ( // dodecahedron — pentagon with inner pentagon
      <g>
        <polygon points="50,6 92,38 76,86 24,86 8,38" fill={accent} stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
        <polygon points="50,30 72,46 64,72 36,72 28,46" fill={color} opacity="0.55"/>
        <line x1="50" y1="6"  x2="50" y2="30" stroke={dark} strokeWidth={stroke*0.5} opacity="0.5"/>
        <line x1="92" y1="38" x2="72" y2="46" stroke={dark} strokeWidth={stroke*0.5} opacity="0.5"/>
        <line x1="76" y1="86" x2="64" y2="72" stroke={dark} strokeWidth={stroke*0.5} opacity="0.5"/>
        <line x1="24" y1="86" x2="36" y2="72" stroke={dark} strokeWidth={stroke*0.5} opacity="0.5"/>
        <line x1="8"  y1="38" x2="28" y2="46" stroke={dark} strokeWidth={stroke*0.5} opacity="0.5"/>
      </g>
    ),
    20: ( // icosahedron — hexagon outer with central triangle
      <g>
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill={accent} stroke={color} strokeWidth={stroke} strokeLinejoin="round"/>
        <polygon points="50,28 76,58 24,58" fill={color} opacity="0.7"/>
        <polygon points="50,28 88,28 76,58" fill={dark} opacity="0.3"/>
        <polygon points="50,28 12,28 24,58" fill={color} opacity="0.4"/>
        <polygon points="76,58 88,72 50,94" fill={dark} opacity="0.45"/>
        <polygon points="24,58 12,72 50,94" fill={dark} opacity="0.35"/>
        <polygon points="76,58 50,94 24,58" fill={color} opacity="0.5"/>
      </g>
    ),
  };

  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block', overflow: 'visible' }}>
      {shapes[type]}
      {showValue && value !== undefined && (
        <text x="50" y="58" textAnchor="middle"
              fontFamily="'Press Start 2P', monospace"
              fontSize={fs} fill={dark}
              style={{ paintOrder: 'stroke', stroke: accent, strokeWidth: stroke, strokeLinejoin: 'round' }}>
          {value}
        </text>
      )}
    </svg>
  );
}

// ───────────────────────────────────────────────────────────
// DICE OVERLAY — opens from the bottom; pick type/qty + roll
// ───────────────────────────────────────────────────────────
function DiceRollerOverlay({ palette, onClose }) {
  const p = palette;
  const T = useT();
  const [type, setType] = ud(20);
  const [qty, setQty] = ud(1);
  const [phase, setPhase] = ud('setup'); // setup | rolling | result
  const [results, setResults] = ud([]);
  const [rollId, setRollId] = ud(0);

  const roll = () => {
    const next = Array.from({ length: qty }, () => 1 + Math.floor(Math.random() * type));
    setResults(next);
    setRollId(id => id + 1);
    setPhase('rolling');
    setTimeout(() => setPhase('result'), 1150);
  };

  const total = results.reduce((a, b) => a + b, 0);
  const dieTypes = [4, 6, 8, 10, 12, 20];

  return (
    <div className="nt-fade-in" style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.78)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="nt-pop" style={{
        background: p.bg, borderTop: `3px solid ${p.gold}`,
        padding: 16, maxHeight: '90%', overflowY: 'auto',
        boxShadow: `0 -10px 30px rgba(0,0,0,0.6)`,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DieShape type={20} size={20} color={p.gold} accent={p.bg} dark={p.gold}/>
          <H palette={p} size={11}>{T('diceTitle')}</H>
          <div style={{ flex: 1 }}/>
          <button onClick={onClose} className="nt-btn" style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.ink,
            background: 'transparent', border: `2px solid ${p.line}`, padding: '6px 8px', cursor: 'pointer',
          }}>X</button>
        </div>

        {phase === 'setup' && (
          <>
            <Sub palette={p}>{T('diceChoose')}</Sub>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {dieTypes.map(d => {
                const sel = d === type;
                return (
                  <button key={d} onClick={() => setType(d)} className="nt-btn" style={{
                    background: sel ? p.bg2 : p.panel,
                    outline: `2px solid ${sel ? p.gold : p.line}`, outlineOffset: -2,
                    border: 'none', padding: 10, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    fontFamily: 'inherit',
                  }}>
                    <DieShape type={d} size={44}
                              color={sel ? p.gold : p.inkDim}
                              accent={sel ? p.bg : p.bg2}
                              dark={p.darkest}/>
                    <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11,
                                  color: sel ? p.gold : p.ink, letterSpacing: 1 }}>D{d}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 4 }}>
              <Sub palette={p}>{T('diceQty')}</Sub>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="nt-btn" style={qtyBtnD(p)}>−</button>
              <div style={{
                width: 60, height: 44, background: p.bg2,
                outline: `2px solid ${p.gold}`, outlineOffset: -2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Press Start 2P", monospace', fontSize: 18, color: p.gold,
              }}>{qty}</div>
              <button onClick={() => setQty(Math.min(12, qty + 1))} className="nt-btn" style={qtyBtnD(p)}>+</button>
            </div>

            <PixelButton palette={p} full size="lg" onClick={roll}>
              {T('diceRoll', { qty, type })}
            </PixelButton>
          </>
        )}

        {(phase === 'rolling' || phase === 'result') && (
          <>
            <Sub palette={p}>{phase === 'rolling' ? T('diceRolling') : T('diceResults')}</Sub>
            <DiceTumble
              palette={p}
              type={type}
              results={results}
              animating={phase === 'rolling'}
              rollId={rollId}
            />
            {phase === 'result' && (
              <div className="nt-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {qty > 1 && (
                  <div style={{ fontFamily: '"VT323", monospace', fontSize: 15, color: p.inkDim, letterSpacing: 1.5 }}>
                    {results.join(' + ')}
                  </div>
                )}
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 22, color: p.gold,
                              letterSpacing: 2, textShadow: `2px 2px 0 ${p.blood}` }}>
                  = {total}
                </div>
                {qty === 1 && type === 20 && results[0] === 20 && (
                  <div className="nt-crit" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10,
                        color: p.green, letterSpacing: 2 }}>★ {T('diceCrit')} ★</div>
                )}
                {qty === 1 && type === 20 && results[0] === 1 && (
                  <div className="nt-crit" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10,
                        color: p.bloodHi, letterSpacing: 2 }}>☠ {T('diceFumble')} ☠</div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <PixelButton palette={p} variant="ghost" full onClick={() => setPhase('setup')}>{T('diceChange')}</PixelButton>
              <PixelButton palette={p} full onClick={roll} disabled={phase === 'rolling'}>
                {phase === 'rolling' ? '...' : T('diceReroll')}
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const qtyBtnD = (p) => ({
  width: 44, height: 44,
  background: p.bg2, outline: `2px solid ${p.gold}`, outlineOffset: -2,
  border: 'none', cursor: 'pointer',
  fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: p.gold,
});

// ───────────────────────────────────────────────────────────
// DICE TUMBLE — the actual animation surface
// ───────────────────────────────────────────────────────────
function DiceTumble({ palette, type, results, animating, rollId }) {
  const p = palette;
  // Determine die size based on qty (smaller when more dice)
  const n = results.length;
  const size = n <= 1 ? 110 : n <= 2 ? 96 : n <= 4 ? 80 : n <= 6 ? 68 : 56;
  return (
    <div className="nt-die-stage" style={{
      minHeight: size + 24,
      background: p.bg2,
      outline: `2px solid ${p.line}`, outlineOffset: -2,
      padding: 14,
      display: 'flex', flexWrap: 'wrap', gap: 10,
      alignItems: 'center', justifyContent: 'center',
    }}>
      {results.map((v, i) => (
        <div key={`${rollId}-${i}`} className="nt-die-3d"
             style={{ ['--die-glow']: p.gold + '88', animationDelay: `${i * 60}ms` }}>
          <div className={animating ? 'nt-die-tumble' : 'nt-die-bounce'}
               style={{ animationDelay: `${i * 60}ms` }}>
            <div className={!animating ? 'nt-die-result' : ''}>
              <DieShape type={type} size={size}
                        color={p.gold} accent={p.bg} dark={p.darkest}
                        value={animating ? '?' : v} showValue/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Dice button (icon-only) — used in battle topbar
// ───────────────────────────────────────────────────────────
function DiceButton({ palette, onClick }) {
  const p = palette;
  return (
    <button onClick={onClick} className="nt-btn" aria-label="dice" style={{
      background: p.panel, outline: `2px solid ${p.gold}`, outlineOffset: -2,
      padding: '5px 8px', cursor: 'pointer', border: 'none',
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      <DieShape type={20} size={20} color={p.gold} accent={p.bg2} dark={p.darkest}/>
      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: p.gold, letterSpacing: 1 }}>D20</span>
    </button>
  );
}

Object.assign(window, { DiceRollerOverlay, DiceButton, DieShape });
