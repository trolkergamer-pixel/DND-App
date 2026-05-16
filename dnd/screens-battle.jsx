// NextTurn — battle + multiplayer screens
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// ─────────────────────────── DM BATTLE ─────────────────────
function DMBattleScreen({ palette, combatants, setCombatants, onExit }) {
  const p = palette;
  const T = useT();
  const order = uM(() => [...combatants].sort((a, b) => b.init - a.init), [combatants]);
  const [turnIdx, setTurnIdx] = uS(0);
  const [round, setRound] = uS(1);
  const [targetId, setTargetId] = uS(null);
  const [dmg, setDmg] = uS('');
  const [showLog, setShowLog] = uS(false);
  const [log, setLog] = uS([{ t: T('dmbRoundActsLog', { round: 1, name: order[0].name }), kind: 'sys' }]);
  const [winner, setWinner] = uS(null);
  const [flashTarget, setFlashTarget] = uS(null);
  const [diceOpen, setDiceOpen] = uS(false);

  const active = order[turnIdx];

  uE(() => {
    if (winner) return;
    const enemiesAlive = combatants.filter(c => c.kind === 'enemy' && c.hp > 0 && !c.dead).length;
    const playersInPlay = combatants.filter(c => c.kind === 'player' && !c.dead && !c.stabilized).length;
    if (enemiesAlive === 0) setWinner('heroes');
    else if (playersInPlay === 0) setWinner('enemies');
  }, [combatants]);

  const advanceTurn = () => {
    setTargetId(null); setDmg('');
    let i = turnIdx, safety = 0;
    do {
      i++;
      if (i >= order.length) { i = 0; setRound(r => r + 1); }
      safety++;
      const nx = order[i];
      const skip = (nx.kind === 'enemy' && nx.hp <= 0) || nx.dead || nx.stabilized;
      if (!skip) break;
    } while (safety < 50);
    setTurnIdx(i);
    setLog(L => [{ t: T('dmbActsLog', { name: order[i].name }), kind: 'sys' }, ...L]);
  };

  const applyDamage = () => {
    const d = parseInt(dmg, 10);
    if (!targetId || isNaN(d) || d <= 0) return;
    const target = combatants.find(c => c.id === targetId);
    if (!target) return;
    const newHp = Math.max(0, target.hp - d);
    setCombatants(combatants.map(c => {
      if (c.id !== targetId) return c;
      const downed = newHp === 0 && c.kind === 'player';
      const dead   = newHp === 0 && c.kind === 'enemy';
      return { ...c, hp: newHp, dead: dead || c.dead, downed };
    }));
    setLog(L => [{ t: T('dmbHitLog', { a: active.name, t: target.name, n: d }), kind: 'hit' }, ...L]);
    setFlashTarget(targetId);
    setTimeout(() => setFlashTarget(null), 350);
    setTargetId(null); setDmg('');
  };

  const heal = (id, amount) => {
    setCombatants(combatants.map(c => c.id === id
      ? { ...c, hp: Math.min(c.maxHp, c.hp + amount),
            downed: c.hp + amount > 0 ? false : c.downed,
            stabilized: c.hp + amount > 0 ? false : c.stabilized,
            deathSaves: { s: 0, f: 0 } }
      : c));
  };

  const deathSave = (id, kind) => {
    setCombatants(combatants.map(c => {
      if (c.id !== id) return c;
      const ds = { ...(c.deathSaves || { s: 0, f: 0 }) };
      ds[kind]++;
      if (ds.s >= 3) {
        setLog(L => [{ t: T('dmbSaveStabilizedLog', { name: c.name }), kind: 'save' }, ...L]);
        return { ...c, deathSaves: { s: 0, f: 0 }, stabilized: true, downed: false };
      }
      if (ds.f >= 3) {
        setLog(L => [{ t: T('dmbDeadLog', { name: c.name }), kind: 'fail' }, ...L]);
        return { ...c, deathSaves: { s: 0, f: 0 }, dead: true, downed: false };
      }
      setLog(L => [{ t: T('dmbSaveLog', { name: c.name, mark: kind === 's' ? '✓' : '✗', s: ds.s, f: ds.f }), kind: kind === 's' ? 'save' : 'fail' }, ...L]);
      return { ...c, deathSaves: ds };
    }));
  };

  if (winner) {
    return (
      <div className="nt-screen nt-fade-in" style={{
        padding: 24, gap: 18, alignItems: 'center', justifyContent: 'center',
        background: winner === 'heroes'
          ? `radial-gradient(ellipse at center, ${p.bg2} 0%, ${p.bg} 70%)`
          : `radial-gradient(ellipse at center, ${p.panelHi} 0%, ${p.bg} 70%)`,
      }}>
        <div className="nt-pop" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 18,
            color: winner === 'heroes' ? p.gold : p.bloodHi, letterSpacing: 3, textAlign: 'center', lineHeight: 1.6,
            textShadow: `2px 2px 0 ${p.blood}` }}>
          {winner === 'heroes' ? T('dmbVictory') : T('dmbDefeat')}
        </div>
        <Cinzel palette={p} size={20}>
          {winner === 'heroes' ? T('dmbVictorySub') : T('dmbDefeatSub')}
        </Cinzel>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {combatants.map((c, i) => (
            <div key={c.id} className="nt-item" style={{ display: 'flex', justifyContent: 'space-between', padding: 10,
                  background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
                  animationDelay: `${i * 50}ms` }}>
              <Cinzel palette={p} size={15}>{c.name}</Cinzel>
              <div style={{ fontFamily: '"VT323", monospace', fontSize: 17,
                color: c.dead ? p.bloodHi : c.stabilized ? p.green : c.kind==='enemy' && c.hp===0 ? p.bloodHi : p.ink }}>
                {c.dead ? T('dmbFallenStatus')
                  : c.stabilized ? T('dmbStabilizedStatus')
                  : c.hp === 0 && c.kind==='enemy' ? T('dmbDefeatedStatus')
                  : T('dmbHpFormat', { hp: c.hp, max: c.maxHp })}
              </div>
            </div>
          ))}
        </div>
        <PixelButton palette={p} size="lg" onClick={onExit}>{T('dmbReturn')}</PixelButton>
      </div>
    );
  }

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('dmbTitle', { n: round })} onBack={onExit}
              rightSlot={<DiceButton palette={p} onClick={() => setDiceOpen(true)}/>}/>

      <div style={{ padding: '10px 12px', background: p.bg2, borderBottom: `2px solid ${p.line}`,
                    display: 'flex', gap: 6, overflowX: 'auto' }}>
        {order.map((c, i) => {
          const isActive = i === turnIdx;
          const out = c.dead || c.stabilized || (c.kind === 'enemy' && c.hp <= 0);
          return (
            <div key={c.id} style={{
              flexShrink: 0, padding: '6px 8px',
              background: isActive ? p.gold : p.panel,
              outline: `2px solid ${isActive ? p.gold : c.kind === 'enemy' ? p.blood : p.line}`,
              outlineOffset: -2,
              opacity: out ? 0.35 : 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              minWidth: 56, transition: 'background 0.2s, outline-color 0.2s',
            }}>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: isActive ? p.bg : p.gold }}>
                {c.init}
              </div>
              <div style={{ fontFamily: '"VT323", monospace', fontSize: 13, color: isActive ? p.bg : p.ink,
                            textTransform: 'uppercase', letterSpacing: 0.5, maxWidth: 64,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            textDecoration: out ? 'line-through' : 'none' }}>{c.name}</div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SectionFrame palette={p} style={{ background: active.kind === 'enemy' ? p.panelHi : p.panel,
                                                outline: `2px solid ${active.kind === 'enemy' ? p.blood : p.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 50, height: 50, background: p.bg2,
                          outline: `2px solid ${active.kind === 'enemy' ? p.blood : p.gold}`, outlineOffset: -2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: '"Press Start 2P", monospace', fontSize: 12,
                          color: active.kind === 'enemy' ? p.bloodHi : p.gold, textTransform: 'uppercase' }}>{active.glyph || active.name.slice(0,2)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: p.inkDim, letterSpacing: 1, marginBottom: 4 }}>
                {active.kind === 'enemy' ? T('dmbEnemyTurn') : T('dmbYourTurn')}
              </div>
              <Cinzel palette={p} size={20}>{active.name}</Cinzel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <HeartIcon size={12} color={p.blood}/>
                <span style={{ fontFamily: '"VT323", monospace', fontSize: 17, color: p.ink }}>{active.hp}/{active.maxHp}</span>
              </div>
              <div style={{ marginTop: 6 }}><HPBar current={active.hp} max={active.maxHp} palette={p}/></div>
            </div>
          </div>
        </SectionFrame>

        {active.kind === 'player' && active.downed && !active.dead && !active.stabilized && (
          <SectionFrame palette={p} accent={p.blood} style={{ background: p.panel, outline: `3px solid ${p.blood}` }}>
            <H palette={p} size={10} color={p.bloodHi}>{T('dmbDeathSaves')}</H>
            <div style={{ marginTop: 8, fontFamily: '"VT323", monospace', fontSize: 16, color: p.ink, lineHeight: 1.3 }}>
              {T('dmbDeathSavesInfo')}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'space-between' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: p.green }}>{T('dmbSuccesses')}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 16, height: 16, background: i < (active.deathSaves?.s || 0) ? p.green : p.bg2,
                                          outline: `2px solid ${p.green}`, outlineOffset: -2,
                                          transition: 'background 0.25s' }}/>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, color: p.bloodHi }}>{T('dmbFailures')}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 16, height: 16, background: i < (active.deathSaves?.f || 0) ? p.blood : p.bg2,
                                          outline: `2px solid ${p.blood}`, outlineOffset: -2,
                                          transition: 'background 0.25s' }}/>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <PixelButton palette={p} variant="green" full onClick={() => deathSave(active.id, 's')}>{T('dmbSuccess')}</PixelButton>
              <PixelButton palette={p} variant="blood" full onClick={() => deathSave(active.id, 'f')}>{T('dmbFailure')}</PixelButton>
            </div>
            <div style={{ marginTop: 8 }}>
              <PixelButton palette={p} variant="ghost" size="sm" full onClick={() => heal(active.id, 1)}>{T('dmbHealOne')}</PixelButton>
            </div>
          </SectionFrame>
        )}

        {active.kind === 'player' && active.stabilized && (
          <SectionFrame palette={p} accent={p.green} style={{ outline: `2px solid ${p.green}` }}>
            <H palette={p} size={10} color={p.green}>{T('dmbStabilized')}</H>
            <div style={{ marginTop: 8, fontFamily: '"VT323", monospace', fontSize: 16, color: p.ink, lineHeight: 1.4 }}>
              {T('dmbStabilizedInfo', { name: active.name })}
            </div>
          </SectionFrame>
        )}

        {!active.downed && !active.dead && !active.stabilized && (
          <SectionFrame palette={p}>
            <H palette={p} size={10}>{T('dmbAttack')}</H>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {combatants.filter(c => c.id !== active.id && !c.dead && !c.stabilized && !(c.kind === 'enemy' && c.hp === 0)).map(t => {
                const isT = t.id === targetId;
                const flash = flashTarget === t.id;
                return (
                  <button key={t.id} onClick={() => setTargetId(t.id)} className={`nt-btn ${flash ? 'nt-shake' : ''}`} style={{
                    background: isT ? p.bg : p.bg2, outline: `2px solid ${isT ? p.gold : p.line}`, outlineOffset: -2,
                    padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    border: 'none', fontFamily: 'inherit',
                  }}>
                    <div style={{ width: 28, height: 28, background: p.bg,
                                  outline: `1px solid ${t.kind === 'enemy' ? p.blood : p.gold}`, outlineOffset: -1,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: '"Press Start 2P", monospace', fontSize: 8,
                                  color: t.kind === 'enemy' ? p.bloodHi : p.gold, textTransform: 'uppercase' }}>{t.glyph || t.name.slice(0,2)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, fontWeight: 600, color: p.ink, letterSpacing: 1 }}>{t.name}</div>
                      <div style={{ marginTop: 4 }}><HPBar current={t.hp} max={t.maxHp} palette={p}/></div>
                    </div>
                    <div style={{ fontFamily: '"VT323", monospace', fontSize: 15, color: p.inkDim, minWidth: 44, textAlign: 'right' }}>
                      {t.hp}/{t.maxHp}
                    </div>
                    {isT && <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: p.gold }}>◆</div>}
                  </button>
                );
              })}
            </div>

            {targetId && (
              <div className="nt-fade-in" style={{ marginTop: 12, paddingTop: 12, borderTop: `2px dashed ${p.line}`, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <PixelInput palette={p} value={dmg} onChange={setDmg} placeholder={T('dmbDamagePh')} type="number" max={4} align="center"/>
                </div>
                <PixelButton palette={p} variant="blood" onClick={applyDamage}>{T('dmbStrike')}</PixelButton>
              </div>
            )}
          </SectionFrame>
        )}

        {active.kind === 'player' && !active.dead && !active.stabilized && (
          <SectionFrame palette={p}>
            <H palette={p} size={10}>{T('dmbQuickHeal')}</H>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {[1, 5, 10].map(n => (
                <PixelButton key={n} palette={p} variant="dark" size="sm" full onClick={() => heal(active.id, n)}>+{n} HP</PixelButton>
              ))}
            </div>
          </SectionFrame>
        )}

        <button onClick={() => setShowLog(!showLog)} className="nt-btn" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: '"VT323", monospace', fontSize: 17, color: p.inkDim, letterSpacing: 2,
          textAlign: 'left', padding: 0, textTransform: 'uppercase',
        }}>{showLog ? '▾' : '▸'} {T('dmbLog', { n: log.length })}</button>
        {showLog && (
          <div className="nt-fade-in" style={{ background: p.bg2, outline: `2px solid ${p.line}`, outlineOffset: -2, padding: 10,
                        maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {log.map((l, i) => (
              <div key={i} style={{ fontFamily: '"VT323", monospace', fontSize: 15, lineHeight: 1.3,
                color: l.kind === 'hit' ? p.bloodHi : l.kind === 'save' ? p.green : l.kind === 'fail' ? p.bloodHi : p.inkDim,
              }}>› {l.t}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 14, borderTop: `2px solid ${p.line}`, background: p.bg2 }}>
        <PixelButton palette={p} full size="lg" onClick={advanceTurn}>{T('dmbEndTurn')}</PixelButton>
      </div>

      {diceOpen && <DiceRollerOverlay palette={p} onClose={() => setDiceOpen(false)}/>}
    </div>
  );
}

// ─────────────────────────── MULTIPLAYER ───────────────────
function MPHubScreen({ palette, onPick, onBack }) {
  const p = palette;
  const T = useT();
  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('mphTitle')} onBack={onBack}/>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'center' }}>
        <Sub palette={p}>{T('mphSharedSession')}</Sub>
        <SectionFrame palette={p}>
          <H palette={p} size={11}>{T('mphCreate')}</H>
          <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim, marginTop: 8, lineHeight: 1.3 }}>
            {T('mphCreateInfo')}
          </div>
          <div style={{ marginTop: 12 }}>
            <PixelButton palette={p} full onClick={() => onPick('create')}>{T('mphForge')}</PixelButton>
          </div>
        </SectionFrame>

        <SectionFrame palette={p}>
          <H palette={p} size={11}>{T('mphJoin')}</H>
          <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim, marginTop: 8, lineHeight: 1.3 }}>
            {T('mphJoinInfo')}
          </div>
          <div style={{ marginTop: 12 }}>
            <PixelButton palette={p} variant="dark" full onClick={() => onPick('join')}>{T('mphFind')}</PixelButton>
          </div>
        </SectionFrame>
      </div>
    </div>
  );
}

function MPCreateScreen({ palette, onBack }) {
  const p = palette;
  const T = useT();
  const code = uM(() => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, []);
  const [players, setPlayers] = uS([]);
  uE(() => {
    const names = ['Eldra', 'Borin', 'Kael'];
    const ts = [1800, 3600, 5500];
    const timers = ts.map((t, i) => setTimeout(() => setPlayers(prev => [...prev, names[i]]), t));
    return () => timers.forEach(clearTimeout);
  }, []);

  const qrCells = uM(() => {
    let seed = 0; for (const c of code) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed >>> 0) / 0xffffffff; };
    const N = 25; const arr = Array.from({ length: N }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) arr[y][x] = rng() > 0.5 ? 1 : 0;
    const stamp = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        arr[y + oy][x + ox] = (edge || inner) ? 1 : 0;
      }
    };
    stamp(0,0); stamp(N-7,0); stamp(0,N-7);
    return arr;
  }, [code]);

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('mpcTitle')} onBack={onBack}/>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18, flex: 1, overflowY: 'auto' }}>
        <Sub palette={p}>{T('mpcCode')}</Sub>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {code.split('').map((c, i) => (
            <div key={i} className="nt-pop" style={{
              width: 38, height: 50, background: p.panel,
              outline: `2px solid ${p.gold}`, outlineOffset: -2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Press Start 2P", monospace', fontSize: 22, color: p.gold,
              boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.3)`,
              animationDelay: `${i * 60}ms`,
            }}>{c}</div>
          ))}
        </div>

        <SectionFrame palette={p}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
            <div style={{ background: '#fff', padding: 8, display: 'grid',
                          gridTemplateColumns: `repeat(${qrCells.length}, 1fr)`, gap: 0, width: 200, height: 200 }}>
              {qrCells.flat().map((v, i) => (
                <div key={i} style={{ background: v ? '#000' : '#fff', width: '100%', aspectRatio: '1/1' }}/>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim, textAlign: 'center', marginTop: 10, letterSpacing: 1 }}>
            {T('mpcAimCamera')}
          </div>
        </SectionFrame>

        <div>
          <Sub palette={p}>{T('mpcConnected', { n: players.length })}</Sub>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {players.length === 0 && (
              <div style={{ padding: 14, background: p.panel, outline: `2px dashed ${p.line}`, outlineOffset: -2,
                            fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim, textAlign: 'center' }}>
                {T('mpcWaiting')}
              </div>
            )}
            {players.map((n, i) => (
              <div key={i} className="nt-item" style={{ padding: 10, background: p.panel, outline: `2px solid ${p.line}`, outlineOffset: -2,
                                     display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, background: p.green, boxShadow: `0 0 4px ${p.green}` }}/>
                <Cinzel palette={p} size={15}>{n}</Cinzel>
                <div style={{ flex: 1 }}/>
                <div style={{ fontFamily: '"VT323", monospace', fontSize: 14, color: p.inkDim }}>{T('mpcConnectedTag')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: 14, borderTop: `2px solid ${p.line}`, background: p.bg2 }}>
        <PixelButton palette={p} variant="dark" full size="lg" disabled={players.length === 0}>
          {T('mpcStartCampaign', { n: players.length })}
        </PixelButton>
      </div>
    </div>
  );
}

function MPJoinScreen({ palette, onBack }) {
  const p = palette;
  const T = useT();
  const [mode, setMode] = uS('scan');
  const [code, setCode] = uS('');
  const [scanLine, setScanLine] = uS(0);

  uE(() => {
    if (mode !== 'scan') return;
    const i = setInterval(() => setScanLine(l => (l + 4) % 200), 32);
    return () => clearInterval(i);
  }, [mode]);

  return (
    <div className="nt-screen">
      <TopBar palette={p} title={T('mpjTitle')} onBack={onBack}/>
      <div style={{ display: 'flex', gap: 0, margin: 14, outline: `2px solid ${p.line}`, outlineOffset: -2 }}>
        {[['scan', T('mpjScan')], ['manual', T('mpjManual')]].map(([k, lbl]) => (
          <button key={k} onClick={() => setMode(k)} className="nt-btn" style={{
            flex: 1, fontFamily: '"Press Start 2P", monospace', fontSize: 9, padding: 12,
            background: mode === k ? p.gold : p.panel, color: mode === k ? p.bg : p.ink,
            border: 'none', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
          }}>{lbl}</button>
        ))}
      </div>

      {mode === 'scan' ? (
        <div className="nt-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 14, gap: 16 }}>
          <Sub palette={p}>{T('mpjAimQr')}</Sub>
          <div style={{ position: 'relative', width: 240, height: 240, background: p.bg2, outline: `2px solid ${p.line}`, outlineOffset: -2,
                        overflow: 'hidden' }}>
            {[['tl', 0, 0], ['tr', 1, 0], ['bl', 0, 1], ['br', 1, 1]].map(([k, x, y]) => (
              <div key={k} style={{
                position: 'absolute', width: 24, height: 24,
                left: x ? 'auto' : 8, right: x ? 8 : 'auto',
                top: y ? 'auto' : 8, bottom: y ? 8 : 'auto',
                borderTop: y ? 'none' : `3px solid ${p.gold}`,
                borderBottom: y ? `3px solid ${p.gold}` : 'none',
                borderLeft: x ? 'none' : `3px solid ${p.gold}`,
                borderRight: x ? `3px solid ${p.gold}` : 'none',
                zIndex: 2,
              }}/>
            ))}
            <div style={{ position: 'absolute', left: 16, right: 16, top: scanLine, height: 2,
                          background: p.gold, boxShadow: `0 0 6px ${p.gold}`, zIndex: 1 }}/>
            <div style={{ position: 'absolute', inset: 16,
                          backgroundImage: `repeating-linear-gradient(0deg, ${p.bg} 0 4px, ${p.bg2} 4px 8px)` }}/>
          </div>
          <div style={{ fontFamily: '"VT323", monospace', fontSize: 16, color: p.inkDim, textAlign: 'center', lineHeight: 1.4 }}>
            {T('mpjInstructions')}<br/>{T('mpjAuto')}
          </div>
          <PixelButton palette={p} variant="dark" full onClick={() => setMode('manual')}>
            {T('mpjNoCam')}
          </PixelButton>
        </div>
      ) : (
        <div className="nt-fade-in" style={{ flex: 1, padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Sub palette={p}>{T('mpjWriteCode')}</Sub>
          <SectionFrame palette={p}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {Array.from({ length: 6 }).map((_, i) => {
                const c = code[i] || '';
                return (
                  <div key={i} style={{
                    width: 36, height: 48, background: p.bg2, outline: `2px solid ${c ? p.gold : p.line}`, outlineOffset: -2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 18, color: p.gold,
                    transition: 'outline-color 0.2s',
                  }}>{c || '_'}</div>
                );
              })}
            </div>
            <input
              value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              autoFocus
              style={{ width: '100%', marginTop: 12, padding: 10, fontFamily: '"VT323", monospace',
                       fontSize: 20, letterSpacing: 4, textAlign: 'center', background: p.bg, color: p.ink,
                       border: 'none', outline: `2px solid ${p.line}`, outlineOffset: -2, textTransform: 'uppercase' }}
              placeholder={T('mpj6Letters')}
            />
          </SectionFrame>
          <PixelButton palette={p} full size="lg" disabled={code.length < 6}>{T('mpjEnter')}</PixelButton>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { DMBattleScreen, MPHubScreen, MPCreateScreen, MPJoinScreen });
