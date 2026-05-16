// NextTurn — setup screens (home, settings, players, enemies, initiative)
const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

// Gear icon for the settings button
const GearIcon = ({ size = 18, color }) =>
<svg width={size} height={size} viewBox="0 0 20 20">
    <path d="M10 1 L12 3 L14 2 L15 5 L18 6 L17 9 L19 11 L17 13 L18 16 L15 17 L14 20 L12 18 L10 19 L8 18 L6 20 L5 17 L2 16 L3 13 L1 11 L3 9 L2 6 L5 5 L6 2 L8 3 Z" fill={color} />
    <circle cx="10" cy="11" r="3.5" fill="#000" />
  </svg>;


// ─────────────────────────── HOME ──────────────────────────
function HomeScreen({ palette, onPick, onOpenSettings }) {
  const p = palette;
  const T = useT();
  return (
    <div className="nt-screen" style={{ padding: '20px 24px 28px',
      background: `radial-gradient(ellipse at 50% 25%, ${p.bg2} 0%, ${p.bg} 70%)` }}>

      {/* Settings gear top-right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onOpenSettings} className="nt-btn" aria-label={T('settings')} style={{
          background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
          padding: 9, cursor: 'pointer', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <GearIcon size={18} color={p.gold} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div className="nt-pop" style={{ position: 'relative', width: 130, height: 130 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: p.panel,
            outline: `3px solid ${p.gold}`, outlineOffset: -3,
            boxShadow: `0 0 0 6px ${p.bg}, 0 0 0 8px ${p.line}, inset 0 0 24px ${p.bg2}`
          }} />
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) =>
          <div key={i} style={{
            position: 'absolute', width: 10, height: 10, background: p.gold,
            outline: `2px solid ${p.bg}`, outlineOffset: -2,
            left: x ? 'auto' : -3, right: x ? -3 : 'auto',
            top: y ? 'auto' : -3, bottom: y ? -3 : 'auto', zIndex: 2
          }} />
          )}
          <div className="nt-glow" style={{ position: 'absolute', inset: -38,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
            ['--glow']: p.gold + '55'
          }}>
            <SwordsLogo size={196} color={p.gold} accent={p.goldHi} dark={p.darkest} />
          </div>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 26, color: p.gold,
            letterSpacing: 4, textShadow: `3px 3px 0 ${p.blood}`, lineHeight: 1 }}>
            NEXT<span style={{ color: p.blood }}>·</span>TURN
          </div>
          <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim, letterSpacing: 3, textTransform: 'uppercase' }}>
            {T('appTagline')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Sub palette={p}>{T('chooseRole')}</Sub>
        <ModeCard palette={p} onClick={() => onPick('dm')}
        icon={<CrownIcon color={p.bg} size={20} />}
        title={T('dmTitle')} subtitle={T('dmSub')} variant="gold" />
        <ModeCard palette={p} onClick={() => onPick('mp')}
        icon={<BannerIcon color={p.ink} size={20} />}
        title={T('mpTitle')} subtitle={T('mpSub')} variant="dark" />
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontFamily: '"VT323", monospace', fontSize: 14, color: p.inkDim, letterSpacing: 2 }}>
        {T('versionTag')}
      </div>
    </div>);

}

function ModeCard({ palette, onClick, icon, title, subtitle, variant }) {
  const p = palette;
  const isGold = variant === 'gold';
  return (
    <button onClick={onClick} className="nt-btn" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      background: isGold ? p.gold : p.panel,
      color: isGold ? p.bg : p.ink,
      border: 'none', outline: `2px solid ${isGold ? p.gold : p.line}`, outlineOffset: -2,
      cursor: 'pointer', textAlign: 'left',
      boxShadow: `inset 0 -4px 0 rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.10)`,
      fontFamily: 'inherit'
    }}>
      <div style={{
        width: 44, height: 44,
        background: isGold ? p.bg : p.bg2,
        outline: `2px solid ${isGold ? p.bg : p.gold}`, outlineOffset: -2,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { color: p.gold })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, letterSpacing: 1.2, lineHeight: "1" }}>{title}</div>
        <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, marginTop: 4, opacity: 0.8, letterSpacing: 1 }}>{subtitle}</div>
      </div>
      <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, opacity: 0.8 }}>›</div>
    </button>);

}

// ─────────────────────────── SETTINGS ──────────────────────
function SettingsScreen({ palette, paletteKey, setPaletteKey, lang, setLang, scanlines, setScanlines, onBack }) {
  const p = palette;
  const T = useT();
  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('settingsHeader')} onBack={onBack} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>

        <Sub palette={p}>{T('settingsTheme')}</Sub>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(PALETTES).map(([key, pal]) => {
            const active = key === paletteKey;
            return (
              <button key={key} onClick={() => setPaletteKey(key)} className="nt-btn" style={{
                background: active ? pal.panel : p.panel,
                outline: `2px solid ${active ? p.gold : p.line}`, outlineOffset: -2,
                padding: 10, cursor: 'pointer', border: 'none', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 8,
                fontFamily: 'inherit'
              }}>
                <div style={{ display: 'flex', gap: 4, height: 18 }}>
                  <div style={{ flex: 1, background: pal.bg, outline: `1px solid ${pal.line}`, outlineOffset: -1 }} />
                  <div style={{ flex: 1, background: pal.gold }} />
                  <div style={{ flex: 1, background: pal.blood }} />
                  <div style={{ flex: 1, background: pal.ink, outline: `1px solid ${pal.line}`, outlineOffset: -1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {active && <span style={{ color: p.gold, fontFamily: '"Press Start 2P", monospace', fontSize: 9 }}>◆</span>}
                  <span style={{ fontFamily: '"VT323", monospace', fontSize: 15, color: p.ink, letterSpacing: 1 }}>{pal.name}</span>
                </div>
              </button>);

          })}
        </div>

        <Sub palette={p}>{T('settingsLanguage')}</Sub>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['es', T('settingsLangEs'), 'ES'], ['en', T('settingsLangEn'), 'EN']].map(([k, lbl, tag]) => {
            const active = k === lang;
            return (
              <button key={k} onClick={() => setLang(k)} className="nt-btn" style={{
                background: active ? p.gold : p.panel,
                color: active ? p.bg : p.ink,
                outline: `2px solid ${active ? p.gold : p.line}`, outlineOffset: -2,
                padding: '12px 14px', cursor: 'pointer', border: 'none',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'inherit'
              }}>
                <div style={{
                  width: 36, height: 36,
                  background: active ? p.bg : p.bg2,
                  outline: `2px solid ${active ? p.bg : p.gold}`, outlineOffset: -2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Press Start 2P", monospace', fontSize: 10,
                  color: active ? p.gold : p.gold
                }}>{tag}</div>
                <div style={{ fontFamily: '"VT323", monospace', fontSize: 17, letterSpacing: 1 }}>{lbl}</div>
              </button>);

          })}
        </div>

        <Sub palette={p}>{T('settingsEffects')}</Sub>
        <button onClick={() => setScanlines(!scanlines)} className="nt-btn" style={{
          background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
          padding: 12, cursor: 'pointer', border: 'none',
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'inherit', textAlign: 'left'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.gold, letterSpacing: 1.2 }}>{T('settingsScanlines')}</div>
            <div style={{ fontFamily: '"VT323", monospace', fontSize: 14, color: p.inkDim, marginTop: 4 }}>{T('settingsScanlinesSub')}</div>
          </div>
          <div style={{
            width: 44, height: 24, background: scanlines ? p.green : p.bg2,
            outline: `2px solid ${scanlines ? p.green : p.line}`, outlineOffset: -2,
            position: 'relative', transition: 'background 0.2s, outline-color 0.2s'
          }}>
            <div style={{
              position: 'absolute', top: 2, left: scanlines ? 22 : 2,
              width: 18, height: 16, background: scanlines ? p.bg : p.ink,
              transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }} />
          </div>
        </button>

        <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: p.gold, letterSpacing: 2 }}>{T('settingsAbout')}</div>
          <div style={{ marginTop: 6, fontFamily: '"VT323", monospace', fontSize: 14, color: p.inkDim, letterSpacing: 1 }}>{T('settingsAboutLine')}</div>
        </div>
      </div>
    </div>);

}

// ─────────────────────────── TOP BAR ───────────────────────
function TopBar({ palette, title, onBack, rightSlot }) {
  const p = palette;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px',
      borderBottom: `2px solid ${p.line}`, background: p.bg2 }}>
      {onBack &&
      <button onClick={onBack} className="nt-btn" style={{
        fontFamily: '"Press Start 2P", monospace', fontSize: 10,
        background: 'transparent', color: p.gold, border: `2px solid ${p.line}`,
        padding: '6px 8px', cursor: 'pointer'
      }}>‹</button>
      }
      <div style={{ flex: 1, fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: p.gold, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {title}
      </div>
      {rightSlot}
    </div>);

}

// ─────────────────────────── DM PLAYERS ────────────────────
function DMPlayersScreen({ palette, players, setPlayers, onStart, onBack }) {
  const p = palette;
  const T = useT();
  const [name, setName] = useS('');
  const [hp, setHp] = useS('');

  const add = () => {
    if (!name.trim() || !hp || +hp <= 0) return;
    setPlayers([...players, { id: Date.now() + Math.random(), name: name.trim(), maxHp: +hp, hp: +hp,
      kind: 'player', init: 0, dead: false, stabilized: false,
      deathSaves: { s: 0, f: 0 } }]);
    setName('');setHp('');
  };
  const rm = (id) => setPlayers(players.filter((x) => x.id !== id));

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('dmpTitle')} onBack={onBack} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
        <SectionFrame palette={p}>
          <H palette={p} size={11}><PlusIcon size={10} color={p.gold} /> {T('dmpNewHero')}</H>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PixelInput palette={p} value={name} onChange={setName} placeholder={T('dmpNamePh')} max={20} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }}><PixelInput palette={p} value={hp} onChange={setHp} placeholder={T('dmpHpPh')} type="number" max={4} /></div>
              <PixelButton palette={p} onClick={add}>{T('add')}</PixelButton>
            </div>
          </div>
        </SectionFrame>

        <Sub palette={p}>{T('dmpPartyN', { n: players.length })}</Sub>

        {players.length === 0 &&
        <div style={{ textAlign: 'center', padding: 28, fontFamily: '"VT323", monospace', fontSize: 18, color: p.inkDim, letterSpacing: 1 }}>
            {T('dmpEmpty')}
          </div>
        }

        {players.map((pl, i) =>
        <div key={pl.id} className="nt-item" style={{ background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
          padding: 12, display: 'flex', alignItems: 'center', gap: 12,
          animationDelay: `${i * 40}ms` }}>
            <div style={{
            width: 38, height: 38, background: p.bg2, outline: `2px solid ${p.gold}`, outlineOffset: -2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Press Start 2P", monospace', fontSize: 12, color: p.gold
          }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Cinzel palette={p} size={16}>{pl.name}</Cinzel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <HeartIcon color={p.blood} size={12} />
                <span style={{ fontFamily: '"VT323", monospace', fontSize: 18, color: p.ink }}>{pl.hp}/{pl.maxHp}</span>
              </div>
            </div>
            <button onClick={() => rm(pl.id)} className="nt-btn" style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.bloodHi,
            background: 'transparent', border: `2px solid ${p.blood}`, padding: '6px 8px', cursor: 'pointer'
          }}>X</button>
          </div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: `2px solid ${p.line}`, background: p.bg2 }}>
        <PixelButton palette={p} full size="lg" disabled={players.length === 0} onClick={onStart}>
          {T('dmpStart')}
        </PixelButton>
      </div>
    </div>);

}

// ─────────────────────────── DM ENEMIES ────────────────────
function normalizeEnemyNames(enemies) {
  const counts = {};
  enemies.forEach((e) => {counts[e.baseName] = (counts[e.baseName] || 0) + 1;});
  const c = {};
  return enemies.map((e) => {
    if (counts[e.baseName] <= 1) return { ...e, name: e.baseName };
    c[e.baseName] = (c[e.baseName] || 0) + 1;
    return { ...e, name: `${e.baseName} ${String.fromCharCode(64 + c[e.baseName])}` };
  });
}

function DMEnemiesScreen({ palette, enemies, setEnemies, onNext, onBack, allowSkip }) {
  const p = palette;
  const T = useT();
  const [tab, setTab] = useS('bestiary');
  const [picked, setPicked] = useS(null);
  const [qty, setQty] = useS(1);
  const [cname, setCName] = useS('');
  const [chp, setChp] = useS('');

  const addBatch = () => {
    if (!picked) return;
    const next = [...enemies];
    for (let i = 0; i < qty; i++) {
      next.push({ id: Date.now() + Math.random() + i,
        baseName: picked.name, name: picked.name, maxHp: picked.hp, hp: picked.hp,
        ca: picked.ca, glyph: picked.glyph, kind: 'enemy', init: 0, dead: false });
    }
    setEnemies(normalizeEnemyNames(next));
    setPicked(null);setQty(1);
  };
  const addCustom = () => {
    if (!cname.trim() || !chp || +chp <= 0) return;
    const next = [...enemies, { id: Date.now() + Math.random(),
      baseName: cname.trim(), name: cname.trim(), maxHp: +chp, hp: +chp, ca: 10,
      glyph: cname.slice(0, 2).toLowerCase(), kind: 'enemy', init: 0, dead: false }];
    setEnemies(normalizeEnemyNames(next));
    setCName('');setChp('');
  };
  const rm = (id) => setEnemies(normalizeEnemyNames(enemies.filter((x) => x.id !== id)));

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('dmeTitle')} onBack={onBack} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, outline: `2px solid ${p.line}`, outlineOffset: -2 }}>
          {[['bestiary', T('dmeBestiaryTab')], ['custom', T('dmeCustomTab')]].map(([t, lbl]) =>
          <button key={t} onClick={() => setTab(t)} className="nt-btn" style={{
            flex: 1, fontFamily: '"Press Start 2P", monospace', fontSize: 9, padding: 12,
            background: tab === t ? p.gold : p.panel, color: tab === t ? p.bg : p.ink,
            border: 'none', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase'
          }}>{lbl}</button>
          )}
        </div>

        {tab === 'bestiary' ?
        <>
            <SectionFrame palette={p}>
              <H palette={p} size={10}>{T('dmeKnownCreatures')}</H>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {BESTIARY.map((e) => {
                const sel = picked?.name === e.name;
                return (
                  <button key={e.name} onClick={() => {setPicked(e);setQty(1);}} className="nt-btn" style={{
                    background: sel ? p.bg : p.bg2,
                    outline: `2px solid ${sel ? p.gold : p.line}`, outlineOffset: -2,
                    padding: 10, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: 6, border: 'none',
                    fontFamily: 'inherit', position: 'relative'
                  }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 24, background: p.panel, outline: `1px solid ${p.gold}`, outlineOffset: -1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: p.gold, textTransform: 'uppercase' }}>{e.glyph}</div>
                        <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: p.ink, letterSpacing: 0.5, lineHeight: 1.1 }}>{e.name}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontFamily: '"VT323", monospace', fontSize: 15, color: p.inkDim }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><HeartIcon size={10} color={p.blood} />{e.hp}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><ShieldIcon size={10} color={p.gold} />{e.ca}</span>
                      </div>
                      {sel &&
                    <div style={{ position: 'absolute', top: 4, right: 4,
                      fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: p.gold }}>◆</div>
                    }
                    </button>);

              })}
              </div>
            </SectionFrame>

            {picked &&
          <div className="nt-pop" style={{ background: p.panel, outline: `2px solid ${p.gold}`, outlineOffset: -2, padding: 14,
            display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, background: p.bg2, outline: `2px solid ${p.gold}`, outlineOffset: -2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.gold, textTransform: 'uppercase' }}>{picked.glyph}</div>
                  <div style={{ flex: 1 }}>
                    <Cinzel palette={p} size={17}>{picked.name}</Cinzel>
                    <div style={{ fontFamily: '"VT323", monospace', fontSize: 14, color: p.inkDim, letterSpacing: 1 }}>
                      HP {picked.hp} · CA {picked.ca}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <Sub palette={p}>{T('dmeQuantity')}</Sub>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="nt-btn" style={qtyBtn(p)}>−</button>
                  <div style={{
                width: 56, height: 44, background: p.bg, outline: `2px solid ${p.gold}`, outlineOffset: -2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Press Start 2P", monospace', fontSize: 18, color: p.gold
              }}>{qty}</div>
                  <button onClick={() => setQty(Math.min(20, qty + 1))} className="nt-btn" style={qtyBtn(p)}>+</button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <PixelButton palette={p} variant="ghost" full onClick={() => setPicked(null)}>{T('cancel')}</PixelButton>
                  <PixelButton palette={p} full onClick={addBatch}>
                    {T('dmeSummon')} {qty > 1 ? `×${qty}` : ''}
                  </PixelButton>
                </div>
              </div>
          }
          </> :

        <SectionFrame palette={p}>
            <H palette={p} size={11}><PlusIcon size={10} color={p.gold} /> {T('dmeCreateEnemy')}</H>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PixelInput palette={p} value={cname} onChange={setCName} placeholder={T('dmeNamePh')} max={20} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}><PixelInput palette={p} value={chp} onChange={setChp} placeholder="HP" type="number" max={4} /></div>
                <PixelButton palette={p} onClick={addCustom}>{T('forge')}</PixelButton>
              </div>
            </div>
          </SectionFrame>
        }

        <Sub palette={p}>{T('dmeOnField', { n: enemies.length })}</Sub>

        {enemies.length === 0 &&
        <div style={{ textAlign: 'center', padding: 20, fontFamily: '"VT323", monospace', fontSize: 18, color: p.inkDim }}>
            {T('dmeEmpty')}
          </div>
        }

        {enemies.map((en, i) =>
        <div key={en.id} className="nt-item" style={{ background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
          padding: 12, display: 'flex', alignItems: 'center', gap: 12,
          animationDelay: `${i * 30}ms` }}>
            <div style={{ width: 38, height: 38, background: p.bg2, outline: `2px solid ${p.blood}`, outlineOffset: -2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: p.bloodHi, textTransform: 'uppercase' }}>{en.glyph}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Cinzel palette={p} size={16}>{en.name}</Cinzel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HeartIcon size={11} color={p.blood} />{en.hp}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ShieldIcon size={11} color={p.gold} />{en.ca}</span>
              </div>
            </div>
            <button onClick={() => rm(en.id)} className="nt-btn" style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.bloodHi,
            background: 'transparent', border: `2px solid ${p.blood}`, padding: '6px 8px', cursor: 'pointer'
          }}>X</button>
          </div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: `2px solid ${p.line}`, background: p.bg2,
        display: 'flex', gap: 8 }}>
        {allowSkip &&
        <PixelButton palette={p} variant="ghost" onClick={onBack}>{T('cancel')}</PixelButton>
        }
        <div style={{ flex: 1 }}>
          <PixelButton palette={p} full size="lg" disabled={enemies.length === 0} onClick={onNext}>
            {T('dmeStartBattle')}
          </PixelButton>
        </div>
      </div>
    </div>);

}

const qtyBtn = (p) => ({
  width: 44, height: 44,
  background: p.bg2, outline: `2px solid ${p.gold}`, outlineOffset: -2,
  border: 'none', cursor: 'pointer',
  fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: p.gold
});

// ─────────────────────────── DM INITIATIVE ─────────────────
function DMInitiativeScreen({ palette, combatants, setCombatants, onStart, onBack }) {
  const p = palette;
  const T = useT();
  const [rolling, setRolling] = useS(null);
  const [rollVal, setRollVal] = useS(null);

  const rollD20 = (id) => {
    setRolling(id);
    let n = 0;
    const t = setInterval(() => {
      n++;
      setRollVal(1 + Math.floor(Math.random() * 20));
      if (n > 10) {
        clearInterval(t);
        const final = 1 + Math.floor(Math.random() * 20);
        setRollVal(final);
        setCombatants(combatants.map((c) => c.id === id ? { ...c, init: final } : c));
        setTimeout(() => {setRolling(null);setRollVal(null);}, 700);
      }
    }, 60);
  };

  const setInit = (id, v) => {
    const n = parseInt(v, 10);
    setCombatants(combatants.map((c) => c.id === id ? { ...c, init: isNaN(n) ? 0 : n } : c));
  };

  const rollAll = () => {
    setCombatants(combatants.map((c) => ({ ...c, init: 1 + Math.floor(Math.random() * 20) })));
  };

  const allSet = combatants.every((c) => c.init > 0);

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('dmiTitle')} onBack={onBack}
      rightSlot={
      <button onClick={rollAll} className="nt-btn" style={{
        fontFamily: '"Press Start 2P", monospace', fontSize: 9,
        background: p.panel, color: p.gold, border: `2px solid ${p.gold}`,
        padding: '6px 8px', cursor: 'pointer', textTransform: 'uppercase'
      }}>{T('dmiRollAll')}</button>
      } />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
        <Sub palette={p}>{T('dmiPrompt')}</Sub>

        {combatants.map((c, i) => {
          const isRoll = rolling === c.id;
          return (
            <div key={c.id} className="nt-item" style={{ background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2, padding: 12,
              display: 'flex', alignItems: 'center', gap: 10,
              animationDelay: `${i * 30}ms` }}>
              <div style={{
                width: 32, height: 32, background: p.bg2,
                outline: `2px solid ${c.kind === 'enemy' ? p.blood : p.gold}`, outlineOffset: -2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Press Start 2P", monospace', fontSize: 8,
                color: c.kind === 'enemy' ? p.bloodHi : p.gold, textTransform: 'uppercase'
              }}>{c.glyph || c.name.slice(0, 2)}</div>
              <Cinzel palette={p} size={15}>{c.name}</Cinzel>
              <div style={{ flex: 1 }} />
              <div style={{ width: 56 }}>
                <input value={c.init || ''} onChange={(e) => setInit(c.id, e.target.value)} placeholder="—" type="number" style={{
                  width: '100%', fontFamily: '"Press Start 2P", monospace', fontSize: 14,
                  textAlign: 'center', background: p.bg, color: p.gold, padding: '10px 0',
                  border: 'none', outline: `2px solid ${p.gold}`, outlineOffset: -2, boxSizing: 'border-box'
                }} />
              </div>
              <button onClick={() => rollD20(c.id)} className="nt-btn" style={{
                background: isRoll ? p.gold : p.bg2, border: 'none',
                outline: `2px solid ${p.gold}`, outlineOffset: -2,
                padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 44, height: 44
              }}>
                {isRoll ?
                <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: p.bg }}>{rollVal}</span> :

                <D20 size={28} color={p.gold} />
                }
              </button>
            </div>);

        })}
      </div>
      <div style={{ padding: 16, borderTop: `2px solid ${p.line}`, background: p.bg2 }}>
        <PixelButton palette={p} full size="lg" disabled={!allSet} onClick={onStart}>
          {T('dmiStart')}
        </PixelButton>
      </div>
    </div>);

}

Object.assign(window, { HomeScreen, SettingsScreen, TopBar, DMPlayersScreen, DMEnemiesScreen, DMInitiativeScreen, normalizeEnemyNames });