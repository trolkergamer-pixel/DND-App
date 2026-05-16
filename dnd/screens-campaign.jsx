// NextTurn — campaign screen (between battles)
const { useState: usC, useEffect: ueC } = React;

function DMCampaignScreen({ palette, players, setPlayers, onAddEnemies, onBack }) {
  const p = palette;
  const T = useT();
  const [mode, setMode] = usC('idle');
  const [toast, setToast] = usC(null);

  const longRest = () => {
    setPlayers(players.map(pl => ({ ...pl, hp: pl.maxHp, dead: false, stabilized: false,
                                    downed: false, deathSaves: { s: 0, f: 0 } })));
    setToast({ kind: 'gold', msg: T('dmcLongRestToast') });
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('dmcTitle')} onBack={onBack}/>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>

        <SectionFrame palette={p}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CrownIcon size={14} color={p.gold}/>
            <H palette={p} size={11}>{T('dmcParty')}</H>
            <div style={{ flex: 1 }}/>
            <Sub palette={p}>{T('dmcNHeroes', { n: players.length })}</Sub>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.map((pl, i) => {
              const dead = pl.dead;
              const stabilized = pl.stabilized;
              return (
                <div key={pl.id} className="nt-item" style={{
                  background: p.bg2, outline: `2px solid ${dead ? p.blood : p.line}`, outlineOffset: -2,
                  padding: 10, display: 'flex', alignItems: 'center', gap: 10,
                  animationDelay: `${i * 30}ms`,
                  opacity: dead ? 0.5 : 1,
                }}>
                  <div style={{
                    width: 32, height: 32, background: p.bg, outline: `2px solid ${dead ? p.blood : p.gold}`, outlineOffset: -2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: dead ? p.bloodHi : p.gold,
                  }}>{dead ? '☠' : String(i+1).padStart(2,'0')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Cinzel palette={p} size={15}>{pl.name}</Cinzel>
                      {stabilized && !dead && (
                        <span style={{ fontFamily: '"VT323", monospace', fontSize: 13, color: p.green,
                                       padding: '1px 6px', outline: `1px solid ${p.green}`, outlineOffset: -1, letterSpacing: 1 }}>
                          {T('dmcStabilized')}
                        </span>
                      )}
                      {dead && (
                        <span style={{ fontFamily: '"VT323", monospace', fontSize: 13, color: p.bloodHi,
                                       padding: '1px 6px', outline: `1px solid ${p.blood}`, outlineOffset: -1, letterSpacing: 1 }}>
                          {T('dmcFallen')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontFamily: '"VT323", monospace', fontSize: 15, color: p.ink, minWidth: 50 }}>
                        {pl.hp}/{pl.maxHp}
                      </span>
                      <div style={{ flex: 1 }}><HPBar current={pl.hp} max={pl.maxHp} palette={p}/></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionFrame>

        <Sub palette={p}>{T('dmcDmActions')}</Sub>

        <ActionCard palette={p} onClick={onAddEnemies}
                    icon={<SkullIcon size={18} color={p.bloodHi}/>}
                    title={T('dmcAddEnemies')}
                    subtitle={T('dmcAddEnemiesSub')}
                    accent="blood"/>

        <ActionCard palette={p} onClick={longRest}
                    icon={<RestIcon size={18} color={p.green}/>}
                    title={T('dmcLongRest')}
                    subtitle={T('dmcLongRestSub')}
                    accent="green"/>

        <ActionCard palette={p} onClick={() => setMode('shortRest')}
                    icon={<HeartIcon size={16} color={p.gold}/>}
                    title={T('dmcShortRest')}
                    subtitle={T('dmcShortRestSub')}
                    accent="gold"/>

      </div>

      {toast && (
        <div className="nt-pop" style={{
          position: 'absolute', left: 16, right: 16, bottom: 80, zIndex: 30,
          background: p.bg, outline: `2px solid ${p.gold}`, outlineOffset: -2,
          padding: '12px 14px',
          fontFamily: '"VT323", monospace', fontSize: 17, color: p.gold, letterSpacing: 1.5,
          textAlign: 'center',
          boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.4)`,
        }}>✦ {toast.msg} ✦</div>
      )}

      {mode === 'shortRest' && (
        <ShortRestOverlay palette={p} players={players} setPlayers={setPlayers} onClose={() => setMode('idle')}
                          onDone={() => { setMode('idle'); setToast({ msg: T('dmcShortRestToast') });
                                          setTimeout(() => setToast(null), 1800); }}/>
      )}
    </div>
  );
}

function ActionCard({ palette, onClick, icon, title, subtitle, accent }) {
  const p = palette;
  const accentColor = { gold: p.gold, blood: p.blood, green: p.green }[accent] || p.gold;
  return (
    <button onClick={onClick} className="nt-btn" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      background: p.panel, color: p.ink,
      border: 'none', outline: `2px solid ${accentColor}`, outlineOffset: -2,
      cursor: 'pointer', textAlign: 'left',
      boxShadow: `inset 0 -4px 0 rgba(0,0,0,0.3)`,
      fontFamily: 'inherit', position: 'relative',
    }}>
      <div style={{
        width: 40, height: 40,
        background: p.bg2,
        outline: `2px solid ${accentColor}`, outlineOffset: -2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, letterSpacing: 1.2, color: accentColor }}>{title}</div>
        <div style={{ fontFamily: '"VT323", monospace', fontSize: 15, marginTop: 4, color: p.inkDim, letterSpacing: 1 }}>{subtitle}</div>
      </div>
      <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 12, color: accentColor, opacity: 0.8 }}>›</div>
    </button>
  );
}

function ShortRestOverlay({ palette, players, setPlayers, onClose, onDone }) {
  const p = palette;
  const T = useT();
  const [heals, setHeals] = usC(() => Object.fromEntries(players.map(pl => [pl.id, ''])));

  const apply = () => {
    setPlayers(players.map(pl => {
      const h = parseInt(heals[pl.id], 10);
      if (isNaN(h) || h <= 0 || pl.dead) return pl;
      const newHp = Math.min(pl.maxHp, pl.hp + h);
      return { ...pl, hp: newHp,
        downed: newHp > 0 ? false : pl.downed,
        stabilized: newHp > 0 ? false : pl.stabilized,
        deathSaves: newHp > 0 ? { s: 0, f: 0 } : pl.deathSaves };
    }));
    onDone();
  };

  return (
    <div className="nt-fade-in" style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="nt-pop" style={{
        background: p.bg, borderTop: `3px solid ${p.gold}`,
        padding: 16, maxHeight: '85%', overflowY: 'auto',
        boxShadow: `0 -10px 30px rgba(0,0,0,0.5)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <HeartIcon size={14} color={p.gold}/>
          <H palette={p} size={11}>{T('dmcShortRestHeader')}</H>
          <div style={{ flex: 1 }}/>
          <button onClick={onClose} className="nt-btn" style={{
            fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.ink,
            background: 'transparent', border: `2px solid ${p.line}`, padding: '6px 8px', cursor: 'pointer',
          }}>X</button>
        </div>
        <div style={{ fontFamily: '"VT323", monospace', fontSize: 15, color: p.inkDim, marginBottom: 12, letterSpacing: 1 }}>
          {T('dmcShortRestInfo')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.map((pl, i) => (
            <div key={pl.id} className="nt-item" style={{
              background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
              padding: 10, display: 'flex', alignItems: 'center', gap: 10,
              animationDelay: `${i * 30}ms`, opacity: pl.dead ? 0.4 : 1,
            }}>
              <Cinzel palette={p} size={15}>{pl.name}</Cinzel>
              <div style={{ flex: 1, fontFamily: '"VT323", monospace', fontSize: 15, color: p.inkDim }}>
                {pl.hp}/{pl.maxHp}
              </div>
              <div style={{ width: 80 }}>
                <input value={heals[pl.id]} onChange={e => setHeals({ ...heals, [pl.id]: e.target.value })}
                  placeholder="+0" type="number" disabled={pl.dead}
                  style={{
                    width: '100%', fontFamily: '"Press Start 2P", monospace', fontSize: 12,
                    textAlign: 'center', background: p.bg2, color: p.green, padding: '10px 6px',
                    border: 'none', outline: `2px solid ${p.green}`, outlineOffset: -2, boxSizing: 'border-box',
                  }}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <PixelButton palette={p} variant="ghost" full onClick={onClose}>{T('cancel')}</PixelButton>
          <PixelButton palette={p} variant="green" full onClick={apply}>{T('dmcHeal')}</PixelButton>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DMCampaignScreen, ShortRestOverlay, ActionCard });
