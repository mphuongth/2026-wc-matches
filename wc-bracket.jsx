// wc-bracket.jsx — Knockout Bracket UI (Light Theme)
// Depends on: wc-data.js, wc-logic.js, React

const ROUND_LABELS = {
  r32:'Vòng 32', r16:'Vòng 16', qf:'Tứ Kết', sf:'Bán Kết', final:'Chung Kết', third:'Hạng Ba'
};

function TeamSlot({ teamCode, score, isWinner, label }) {
  const t = teamCode ? TEAMS[teamCode] : null;
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:6, padding:'6px 8px',
      background: isWinner ? '#FFFBEB' : '#FFFFFF',
      borderLeft: isWinner ? '3px solid #D97706' : '3px solid transparent',
      minHeight:34,
    }}>
      {t ? (
        <>
          <span style={{ fontSize:16, flexShrink:0 }}>{t.flag}</span>
          <span style={{ fontSize:12, color: isWinner ? '#92400E' : '#334155', fontWeight: isWinner ? 700 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
            {t.vi}
          </span>
          {score != null && (
            <span style={{ fontSize:15, fontWeight:800, color: isWinner ? '#B45309' : '#94A3B8', minWidth:18, textAlign:'center' }}>
              {score}
            </span>
          )}
        </>
      ) : (
        <span style={{ fontSize:11, color:'#94A3B8', fontStyle:'italic' }}>{label || 'TBD'}</span>
      )}
    </div>
  );
}

// Fixed modal for score entry
function KnockoutEditModal({ t1, t2, existing, onSave, onClose }) {
  const [hs, setHs] = React.useState(existing ? String(existing.h ?? '') : '');
  const [as, setAs] = React.useState(existing ? String(existing.a ?? '') : '');
  const [pen, setPen] = React.useState(existing?.pen || '');

  const isDrawInput = hs !== '' && as !== '' && parseInt(hs) === parseInt(as) && !isNaN(parseInt(hs));
  React.useEffect(() => { if (!isDrawInput) setPen(''); }, [isDrawInput]);

  function save() {
    const h = parseInt(hs, 10), a = parseInt(as, 10);
    if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) {
      const payload = { h, a };
      if (isDrawInput && pen) payload.pen = pen;
      onSave(payload);
    } else if (hs === '' && as === '') {
      onSave(null);
    }
    onClose();
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (!isDrawInput || pen)) save();
    if (e.key === 'Escape') onClose();
  }

  const canSave = hs !== '' && as !== '' && !isNaN(parseInt(hs)) && !isNaN(parseInt(as)) && (!isDrawInput || pen);

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,23,42,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={e => e.stopPropagation()} onKeyDown={handleKey} style={{
        background:'#FFFFFF', border:'1px solid #E2E8F0',
        borderRadius:14, padding:22, boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
        minWidth:290, maxWidth:340, width:'90vw',
      }}>
        {/* Header */}
        <div style={{ fontSize:11, fontWeight:700, color:'#C8102E', letterSpacing:1, marginBottom:16, textAlign:'center', background:'#FFF5F5', padding:'7px', borderRadius:7 }}>
          NHẬP KẾT QUẢ VÒNG LOẠI TRỰC TIẾP
        </div>

        {/* Teams + scores */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ flex:1, textAlign:'right' }}>
            <div style={{ fontSize:22 }}>{TEAMS[t1]?.flag}</div>
            <div style={{ fontSize:12, color:'#334155', marginTop:2, fontWeight:600 }}>{TEAMS[t1]?.vi}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <input autoFocus type="number" min="0" max="99" value={hs} onChange={e => setHs(e.target.value)}
              style={{ width:50, textAlign:'center', background:'#F8FAFC', border:'2px solid #2563EB', borderRadius:6, color:'#1E293B', fontSize:22, fontWeight:800, padding:'6px 0', outline:'none' }} />
            <span style={{ color:'#CBD5E1', fontWeight:700, fontSize:18 }}>–</span>
            <input type="number" min="0" max="99" value={as} onChange={e => setAs(e.target.value)}
              style={{ width:50, textAlign:'center', background:'#F8FAFC', border:'2px solid #2563EB', borderRadius:6, color:'#1E293B', fontSize:22, fontWeight:800, padding:'6px 0', outline:'none' }} />
          </div>
          <div style={{ flex:1, textAlign:'left' }}>
            <div style={{ fontSize:22 }}>{TEAMS[t2]?.flag}</div>
            <div style={{ fontSize:12, color:'#334155', marginTop:2, fontWeight:600 }}>{TEAMS[t2]?.vi}</div>
          </div>
        </div>

        {/* Penalty */}
        {isDrawInput && (
          <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:12, marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#92400E', marginBottom:8, textAlign:'center', letterSpacing:0.5 }}>
              ⚽ HÒA — CHỌN ĐỘI THẮNG LOẠT SÚT PHẠT
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {[[t1,'h'],[t2,'a']].map(([team, side]) => (
                <button key={side} onClick={() => setPen(side)} style={{
                  flex:1, padding:'8px 0', borderRadius:6, border:'2px solid',
                  borderColor: pen === side ? '#D97706' : '#E2E8F0',
                  background: pen === side ? '#FFFBEB' : '#F8FAFC',
                  color: pen === side ? '#92400E' : '#64748B',
                  fontSize:12, fontWeight: pen === side ? 700 : 400,
                  cursor:'pointer', transition:'all 0.15s',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                }}>
                  <span style={{ fontSize:18 }}>{TEAMS[team]?.flag}</span>
                  <span>{TEAMS[team]?.vi}</span>
                  {pen === side && <span style={{ fontSize:10, color:'#D97706' }}>✓ Đã chọn</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={save} disabled={!canSave} style={{
            flex:1, padding:'9px 0', borderRadius:6, border:'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            background: canSave ? '#2563EB' : '#F1F5F9',
            color: canSave ? '#FFF' : '#94A3B8',
            fontSize:13, fontWeight:700,
          }}>✓ Lưu kết quả</button>
          <button onClick={onClose} style={{ padding:'9px 16px', borderRadius:6, border:'1px solid #E2E8F0', background:'transparent', color:'#64748B', fontSize:13, cursor:'pointer' }}>Hủy</button>
          {existing && (
            <button onClick={() => { onSave(null); onClose(); }} style={{ padding:'9px 12px', borderRadius:6, border:'1px solid #FECACA', background:'transparent', color:'#DC2626', fontSize:12, cursor:'pointer' }} title="Xóa kết quả">🗑</button>
          )}
        </div>
      </div>
    </div>
  );
}

function KnockoutMatchCard({ matchDef, allStandings, thirdPlace, knockoutResults, onSave, isHighlighted }) {
  const [editing, setEditing] = React.useState(false);
  const { t1, t2 } = resolveKnockoutMatch(matchDef.id, allStandings, thirdPlace, knockoutResults);
  const r = knockoutResults[matchDef.id];
  const hasResult = r && r.h != null && r.a != null;

  let winner = null;
  if (hasResult) {
    if (r.h > r.a) winner = t1;
    else if (r.a > r.h) winner = t2;
    else if (r.pen === 'h') winner = t1;
    else if (r.pen === 'a') winner = t2;
  }

  const m = matchDef;
  function getLabel(slot) {
    if (m.t1 && m.t2) return slotLabel(slot === 't1' ? m.t1 : m.t2);
    if (m.prev) return prevMatchLabel(m.prev[slot === 't1' ? 0 : 1]);
    return 'TBD';
  }

  return (
    <>
      <div style={{
        background: hasResult ? '#F8FAFC' : '#FFFFFF',
        border: `1px solid ${isHighlighted ? 'rgba(200,16,46,0.3)' : hasResult ? '#DBEAFE' : '#E2E8F0'}`,
        borderRadius:8, overflow:'hidden',
        cursor: (t1 && t2) ? 'pointer' : 'default',
        width:182, flexShrink:0,
        boxShadow: isHighlighted ? '0 2px 12px rgba(200,16,46,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition:'box-shadow 0.15s',
      }} onClick={() => (t1 && t2) && setEditing(true)} title={t1 && t2 ? 'Click để nhập kết quả' : ''}>
        <TeamSlot teamCode={t1} score={hasResult ? r.h : null} isWinner={winner === t1} label={getLabel('t1')} />
        <div style={{ height:1, background:'#F1F5F9' }} />
        <TeamSlot teamCode={t2} score={hasResult ? r.a : null} isWinner={winner === t2} label={getLabel('t2')} />
        {hasResult && r.h === r.a && r.pen && (
          <div style={{ textAlign:'center', fontSize:10, color:'#92400E', padding:'3px 0', background:'#FFFBEB', fontWeight:700, borderTop:'1px solid #FDE68A' }}>
            🥅 Pen: {r.pen === 'h' ? TEAMS[t1]?.vi : TEAMS[t2]?.vi} thắng
          </div>
        )}
      </div>
      {editing && t1 && t2 && (
        <KnockoutEditModal t1={t1} t2={t2} existing={r}
          onSave={payload => onSave(matchDef.id, payload)}
          onClose={() => setEditing(false)} />
      )}
    </>
  );
}

function RoundColumn({ roundKey, matches, allStandings, thirdPlace, knockoutResults, onSave }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center' }}>
      <div style={{ fontSize:10, fontWeight:800, color:'#C8102E', textTransform:'uppercase', letterSpacing:1.5, marginBottom:4, whiteSpace:'nowrap', background:'#FFF5F5', padding:'3px 8px', borderRadius:4 }}>
        {ROUND_LABELS[roundKey] || roundKey}
      </div>
      {matches.map(m => (
        <div key={m.id} style={{ position:'relative' }}>
          <KnockoutMatchCard matchDef={m} allStandings={allStandings} thirdPlace={thirdPlace}
            knockoutResults={knockoutResults} onSave={onSave}
            isHighlighted={roundKey === 'final' || roundKey === 'sf'} />
        </div>
      ))}
    </div>
  );
}

function ThirdPlacePanel({ allStandings }) {
  const all = Object.entries(allStandings).map(([grp, st]) => ({ ...st[2], fromGroup: grp })).filter(t => t && t.played > 0);
  const sorted = [...all].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return TEAMS[a.team].rank - TEAMS[b.team].rank;
  });
  if (sorted.length === 0) return (
    <div style={{ textAlign:'center', color:'#94A3B8', padding:40 }}>Điền kết quả vòng bảng để xem xếp hạng hạng ba.</div>
  );

  return (
    <div style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:10, padding:16, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#047857', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
        🏅 XẾP HẠNG ĐỘI HẠNG BA — 8 đội tốt nhất vào Vòng 32
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr style={{ color:'#94A3B8', borderBottom:'2px solid #E2E8F0' }}>
              {['#','Đội','Bảng','Tr','T','H','B','BT','BB','HS','Đ'].map(h => (
                <th key={h} style={{ padding:'3px 8px 8px', textAlign: h === 'Đội' ? 'left' : 'center', fontWeight:600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const qual = i < 8;
              return (
                <tr key={r.team} style={{ background: qual ? 'rgba(16,185,129,0.04)' : 'transparent', borderBottom:'1px solid #F1F5F9', opacity: r.played === 0 ? 0.4 : 1 }}>
                  <td style={{ padding:'6px 8px', textAlign:'center', color: qual ? '#047857' : '#94A3B8', fontWeight:700 }}>{i+1}</td>
                  <td style={{ padding:'6px 8px' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span>{TEAMS[r.team]?.flag}</span>
                      <span style={{ color: qual ? '#047857' : '#64748B', fontWeight: qual ? 600 : 400 }}>{TEAMS[r.team]?.vi}</span>
                      {qual && <span style={{ fontSize:9, color:'#047857', background:'rgba(16,185,129,0.1)', borderRadius:3, padding:'0 4px' }}>VÒNG 32</span>}
                    </span>
                  </td>
                  <td style={{ textAlign:'center', color:'#94A3B8' }}>Bảng {r.fromGroup}</td>
                  {[r.played,r.w,r.d,r.l,r.gf,r.ga,(r.gd>0?'+':'')+r.gd,r.pts].map((v,ci) => (
                    <td key={ci} style={{ textAlign:'center', padding:'6px', color: ci===7?'#B45309':ci===6?(v>0?'#047857':v<0?'#DC2626':'#94A3B8'):'#475569', fontWeight:ci===7?800:400 }}>{v}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KnockoutTab({ groupResults, knockoutResults, onSave, allStandings, thirdPlace }) {
  const [view, setView] = React.useState('bracket');
  const rounds = [
    { key:'r32',   matches: BRACKET.r32 },
    { key:'r16',   matches: BRACKET.r16 },
    { key:'qf',    matches: BRACKET.qf  },
    { key:'sf',    matches: BRACKET.sf  },
    { key:'final', matches: [BRACKET.final[0]] },
    { key:'third', matches: [BRACKET.final[1]] },
  ];

  return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['bracket','🏆 Sơ Đồ Đấu'],['3rd','🥉 Hạng Ba']].map(([k,l]) => (
          <button key={k} onClick={() => setView(k)} style={{
            padding:'7px 16px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:700,
            border: `1px solid ${view===k ? '#2563EB' : '#E2E8F0'}`,
            background: view === k ? '#2563EB' : '#FFFFFF',
            color: view === k ? '#FFF' : '#64748B',
          }}>{l}</button>
        ))}
      </div>

      {view === '3rd' && <ThirdPlacePanel allStandings={allStandings} />}

      {view === 'bracket' && (
        <div style={{ overflowX:'auto', paddingBottom:16 }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start', minWidth:'fit-content', padding:'4px 2px' }}>
            {rounds.map(({ key, matches }) => (
              <RoundColumn key={key} roundKey={key} matches={matches}
                allStandings={allStandings} thirdPlace={thirdPlace}
                knockoutResults={knockoutResults} onSave={onSave} />
            ))}
          </div>
          <div style={{ marginTop:10, fontSize:11, color:'#94A3B8' }}>
            * Phân chia vòng 32 là sơ bộ — sơ đồ chính thức phụ thuộc vào nhóm đội hạng ba được chọn.
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { KnockoutTab });
