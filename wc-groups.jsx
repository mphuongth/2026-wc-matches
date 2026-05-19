// wc-groups.jsx — Group Stage UI (Light Theme)
// Depends on globals: TEAMS, GROUPS, GROUP_MATCHES, computeStandings, toVNTime,
//                     isMatchLive, isMatchSoon, React

function TeamRow({ team, qualified }) {
  const t = TEAMS[team];
  if (!t) return null;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
      <span style={{ fontSize:18 }}>{t.flag}</span>
      <span style={{
        fontWeight: qualified ? 700 : 400,
        color: qualified === 1 ? '#B45309' : qualified === 2 ? '#1D4ED8' : qualified === '3rd' ? '#047857' : '#334155',
        fontSize: 13,
      }}>{t.vi}</span>
    </span>
  );
}

function StandingsTable({ groupCode, results }) {
  const rows = computeStandings(groupCode, results);

  return (
    <div style={{ overflowX:'auto', marginBottom:12 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ color:'#94A3B8', textAlign:'center', borderBottom:'2px solid #E2E8F0' }}>
            <th style={{ textAlign:'left', paddingLeft:8, paddingBottom:6 }}>#</th>
            <th style={{ textAlign:'left', paddingBottom:6 }}>Đội</th>
            {['Tr','T','H','B','BT','BB','HS','Đ'].map(h => (
              <th key={h} style={{ padding:'0 6px 6px', minWidth:28, fontWeight:600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const qual = i === 0 ? 1 : i === 1 ? 2 : '3rd';
            const bg = i === 0 ? 'rgba(251,191,36,0.06)' : i === 1 ? 'rgba(59,130,246,0.05)' : 'transparent';
            return (
              <tr key={r.team} style={{ background: bg, borderBottom:'1px solid #F1F5F9' }}>
                <td style={{ padding:'8px 4px 8px 8px', color:'#94A3B8', fontWeight:700 }}>{i+1}</td>
                <td style={{ padding:'8px 8px 8px 0', minWidth:130 }}>
                  <TeamRow team={r.team} qualified={qual} />
                </td>
                {[r.played,r.w,r.d,r.l,r.gf,r.ga,
                  (r.gd > 0 ? '+' : '') + r.gd,
                  r.pts
                ].map((v, ci) => (
                  <td key={ci} style={{
                    textAlign:'center', padding:'8px 4px',
                    fontWeight: ci === 7 ? 800 : 400,
                    color: ci === 7 ? '#B45309' : ci === 6 ? (v > 0 ? '#047857' : v < 0 ? '#DC2626' : '#94A3B8') : '#475569',
                    fontSize: ci === 7 ? 14 : 13,
                  }}>{v}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ display:'flex', gap:16, padding:'6px 8px', fontSize:11, color:'#94A3B8' }}>
        <span><span style={{color:'#B45309'}}>■</span> Nhất bảng</span>
        <span><span style={{color:'#1D4ED8'}}>■</span> Nhì bảng</span>
        <span><span style={{color:'#047857'}}>■</span> Hạng ba (có thể qua vòng)</span>
      </div>
    </div>
  );
}

function ScoreInput({ matchId, result, onSave }) {
  const [editing, setEditing] = React.useState(false);
  const [hs, setHs] = React.useState('');
  const [as, setAs] = React.useState('');

  function startEdit() {
    setHs(result ? String(result.h) : '');
    setAs(result ? String(result.a) : '');
    setEditing(true);
  }

  function save() {
    const h = parseInt(hs, 10);
    const a = parseInt(as, 10);
    if (!isNaN(h) && !isNaN(a) && h >= 0 && a >= 0) onSave({ h, a });
    else if (hs === '' && as === '') onSave(null);
    setEditing(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') setEditing(false);
  }

  if (editing) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:6 }} onClick={e => e.stopPropagation()}>
        <input autoFocus type="number" min="0" max="99" value={hs}
          onChange={e => setHs(e.target.value)} onKeyDown={handleKey}
          style={{ width:40, textAlign:'center', background:'#F8FAFC', border:'2px solid #2563EB', borderRadius:4, color:'#1E293B', fontSize:16, fontWeight:700, padding:'3px 0', outline:'none' }} />
        <span style={{ color:'#94A3B8', fontWeight:700 }}>–</span>
        <input type="number" min="0" max="99" value={as}
          onChange={e => setAs(e.target.value)} onKeyDown={handleKey}
          style={{ width:40, textAlign:'center', background:'#F8FAFC', border:'2px solid #2563EB', borderRadius:4, color:'#1E293B', fontSize:16, fontWeight:700, padding:'3px 0', outline:'none' }} />
        <button onClick={save} style={{ background:'#2563EB', border:'none', borderRadius:4, color:'#FFF', fontSize:11, padding:'3px 8px', cursor:'pointer', fontWeight:700 }}>✓</button>
        <button onClick={() => setEditing(false)} style={{ background:'transparent', border:'1px solid #E2E8F0', borderRadius:4, color:'#94A3B8', fontSize:11, padding:'3px 6px', cursor:'pointer' }}>✕</button>
      </div>
    );
  }

  const hasResult = result && result.h != null && result.a != null;
  return (
    <div onClick={startEdit} title="Click để nhập kết quả" style={{
      display:'flex', alignItems:'center', gap:8, cursor:'pointer',
      padding:'2px 8px', borderRadius:6,
      border: hasResult ? '1px solid #DBEAFE' : '1px dashed #CBD5E1',
      background: hasResult ? '#EFF6FF' : '#F8FAFC',
      transition:'all 0.15s',
    }}>
      {hasResult ? (
        <>
          <span style={{ fontSize:18, fontWeight:800, color: result.h > result.a ? '#B45309' : '#334155', minWidth:24, textAlign:'center' }}>{result.h}</span>
          <span style={{ color:'#CBD5E1', fontWeight:600, fontSize:14 }}>–</span>
          <span style={{ fontSize:18, fontWeight:800, color: result.a > result.h ? '#B45309' : '#334155', minWidth:24, textAlign:'center' }}>{result.a}</span>
        </>
      ) : (
        <span style={{ color:'#CBD5E1', fontSize:13, letterSpacing:2 }}>vs</span>
      )}
    </div>
  );
}

function MatchCard({ match, result, onSave }) {
  const t = toVNTime(match.utc);
  const homeTeam = TEAMS[match.h];
  const awayTeam = TEAMS[match.a];
  const hasResult = result && result.h != null && result.a != null;
  const live = isMatchLive(match.utc);
  const soon = !live && isMatchSoon(match.utc);

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 12px', borderRadius:8, marginBottom:6,
      background: live ? '#FFF5F5' : hasResult ? '#F8FAFC' : '#FFFFFF',
      border: `1px solid ${live ? 'rgba(200,16,46,0.3)' : hasResult ? '#DBEAFE' : '#E2E8F0'}`,
      boxShadow: live ? '0 0 0 2px rgba(200,16,46,0.08)' : 'none',
    }}>
      {/* Time */}
      <div style={{ minWidth:82, fontSize:11, lineHeight:1.5, flexShrink:0 }}>
        <div style={{ color:'#64748B', fontWeight:600 }}>{t.day} {t.date}</div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {live ? (
            <span style={{ fontSize:10, fontWeight:700, color:'#FFF', background:'#C8102E', padding:'1px 5px', borderRadius:3, letterSpacing:0.5, animation:'livePulse 1.4s ease-in-out infinite' }}>● LIVE</span>
          ) : soon ? (
            <span style={{ fontSize:10, color:'#D97706', fontWeight:600 }}>⏱ {t.time}</span>
          ) : (
            <span style={{ color:'#94A3B8', fontSize:12 }}>{t.time} VNT</span>
          )}
        </div>
      </div>

      {/* Home */}
      <div style={{ flex:1, display:'flex', justifyContent:'flex-end', alignItems:'center', gap:6, minWidth:0 }}>
        <span style={{ fontSize:12, color: hasResult && result.h > result.a ? '#B45309' : '#334155', fontWeight: hasResult && result.h > result.a ? 700 : 400, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {homeTeam?.vi}
        </span>
        <span style={{ fontSize:20, flexShrink:0 }}>{homeTeam?.flag}</span>
      </div>

      {/* Score */}
      <div style={{ flexShrink:0 }}>
        <ScoreInput matchId={match.id} result={result} onSave={onSave} />
      </div>

      {/* Away */}
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
        <span style={{ fontSize:20, flexShrink:0 }}>{awayTeam?.flag}</span>
        <span style={{ fontSize:12, color: hasResult && result.a > result.h ? '#B45309' : '#334155', fontWeight: hasResult && result.a > result.h ? 700 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {awayTeam?.vi}
        </span>
      </div>

      {/* MD badge */}
      <div style={{ fontSize:10, color:'#94A3B8', background:'#F1F5F9', borderRadius:4, padding:'2px 5px', flexShrink:0, minWidth:28, textAlign:'center' }}>
        L{match.md}
      </div>
    </div>
  );
}

function GroupPanel({ groupCode, results, onSave }) {
  const matches = GROUP_MATCHES.filter(m => m.g === groupCode);
  const byDay = [1,2,3].map(d => matches.filter(m => m.md === d));

  return (
    <div>
      <StandingsTable groupCode={groupCode} results={results} />
      <div style={{ height:1, background:'#E2E8F0', margin:'12px 0' }} />
      {byDay.map((day, di) => (
        <div key={di} style={{ marginBottom: di < 2 ? 14 : 0 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>
            Lượt {di+1}
          </div>
          {day.map(m => (
            <MatchCard key={m.id} match={m} result={results[m.id]} onSave={r => onSave(m.id, r)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function GroupStageTab({ results, onSave }) {
  const [activeGroup, setActiveGroup] = React.useState('A');
  const groupKeys = Object.keys(GROUPS);

  return (
    <div>
      {/* Group selector */}
      <div className="group-scroller" style={{ display:'flex', gap:4, overflowX:'auto', padding:'0 4px 12px 0', scrollbarWidth:'thin' }}>
        {groupKeys.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)} style={{
            flex:'0 0 auto', padding:'6px 12px', borderRadius:6, border:`1px solid ${activeGroup===g?'#C8102E':'#E2E8F0'}`,
            cursor:'pointer', fontWeight:700, fontSize:13, letterSpacing:0.3, whiteSpace:'nowrap',
            background: activeGroup === g ? '#C8102E' : '#FFFFFF',
            color: activeGroup === g ? '#FFF' : '#64748B',
            transition:'all 0.15s',
          }}>Bảng {g}</button>
        ))}
      </div>

      {/* Group header */}
      <div style={{ marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:4, height:20, background:'#C8102E', borderRadius:2 }} />
        <span style={{ fontSize:15, fontWeight:800, color:'#1E293B', letterSpacing:0.3 }}>BẢNG {activeGroup}</span>
        <div style={{ flex:1, height:1, background:'#E2E8F0' }} />
        <span style={{ fontSize:14 }}>{GROUPS[activeGroup].map(t => TEAMS[t]?.flag).join(' ')}</span>
      </div>

      <GroupPanel groupCode={activeGroup} results={results} onSave={onSave} />
    </div>
  );
}

// ── Schedule Tab ─────────────────────────────────────────────────────────────
function ScheduleTab({ results, onSave }) {
  const [filterTeam, setFilterTeam] = React.useState('');

  const grouped = React.useMemo(() => {
    const map = {};
    GROUP_MATCHES.forEach(m => {
      const t = toVNTime(m.utc);
      const key = t.date;
      if (!map[key]) map[key] = { label: t.date, day: t.day, matches: [] };
      map[key].matches.push(m);
    });
    Object.values(map).forEach(d => d.matches.sort((a, b) => new Date(a.utc) - new Date(b.utc)));
    return Object.values(map).sort((a, b) => {
      const p = s => { const [d, mo] = s.split('/').map(Number); return mo * 100 + d; };
      return p(a.label) - p(b.label);
    });
  }, []);

  const filtered = React.useMemo(() =>
    grouped.map(day => ({
      ...day,
      matches: day.matches.filter(m => !filterTeam || m.h === filterTeam || m.a === filterTeam),
    })).filter(day => day.matches.length > 0),
  [grouped, filterTeam]);

  const todayLabel = React.useMemo(() => {
    const now = new Date(Date.now() + 7 * 3600 * 1000);
    return `${String(now.getUTCDate()).padStart(2,'0')}/${String(now.getUTCMonth()+1).padStart(2,'0')}`;
  }, []);

  const todayRef = React.useRef(null);
  React.useEffect(() => {
    if (todayRef.current) {
      const top = todayRef.current.getBoundingClientRect().top + document.documentElement.scrollTop - 80;
      document.documentElement.scrollTop = top;
    }
  }, []);

  const dayNames = { 'CN':'Chủ Nhật','T2':'Thứ Hai','T3':'Thứ Ba','T4':'Thứ Tư','T5':'Thứ Năm','T6':'Thứ Sáu','T7':'Thứ Bảy' };
  const allTeams = React.useMemo(() => Object.entries(TEAMS).sort((a,b) => a[1].vi.localeCompare(b[1].vi)), []);
  const liveCount = GROUP_MATCHES.filter(m => isMatchLive(m.utc)).length;

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:16, flexWrap:'wrap',
        background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:10, padding:'10px 14px' }}>
        {liveCount > 0 && (
          <div style={{ fontSize:12, fontWeight:700, color:'#FFF', background:'#C8102E', padding:'5px 12px', borderRadius:6, display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ animation:'livePulse 1.4s ease-in-out infinite' }}>●</span>
            {liveCount} LIVE
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, minWidth:200 }}>
          <span style={{ fontSize:12, color:'#64748B', flexShrink:0, fontWeight:600 }}>Lọc theo đội:</span>
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={{
            flex:1, background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:6,
            color: filterTeam ? '#1D4ED8' : '#64748B', fontSize:13, padding:'6px 10px',
            cursor:'pointer', outline:'none', fontWeight: filterTeam ? 700 : 400,
          }}>
            <option value="">— Tất cả đội —</option>
            {allTeams.map(([code, t]) => (
              <option key={code} value={code}>{t.flag} {t.vi} (Bảng {t.group})</option>
            ))}
          </select>
          {filterTeam && (
            <button onClick={() => setFilterTeam('')} style={{ background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:6, color:'#64748B', fontSize:12, padding:'5px 10px', cursor:'pointer', flexShrink:0 }}>✕</button>
          )}
        </div>
      </div>

      {filterTeam && (
        <div style={{ marginBottom:12, padding:'8px 12px', borderRadius:8, background:'#FFFBEB', border:'1px solid #FDE68A', fontSize:12, color:'#92400E', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>{TEAMS[filterTeam]?.flag}</span>
          <span>{filtered.reduce((s,d)=>s+d.matches.length,0)} trận của <strong>{TEAMS[filterTeam]?.vi}</strong> (Bảng {TEAMS[filterTeam]?.group})</span>
        </div>
      )}

      {filtered.map(({ label, day, matches }) => {
        const isToday = label === todayLabel;
        const hasLive = matches.some(m => isMatchLive(m.utc));
        const allDone = matches.every(m => results[m.id] && results[m.id].h != null);
        return (
          <div key={label} ref={isToday ? todayRef : null} style={{ marginBottom:16 }}>
            <div style={{
              display:'flex', alignItems:'center', gap:10, marginBottom:8,
              padding:'9px 14px', borderRadius:8,
              background: isToday ? '#FFF5F5' : hasLive ? '#FFF5F5' : '#FFFFFF',
              border:`1px solid ${(isToday||hasLive) ? 'rgba(200,16,46,0.25)' : '#E2E8F0'}`,
              boxShadow: isToday ? '0 1px 4px rgba(200,16,46,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              {isToday && <span style={{ fontSize:10, fontWeight:700, background:'#C8102E', color:'#FFF', padding:'2px 7px', borderRadius:4, letterSpacing:0.5 }}>HÔM NAY</span>}
              {hasLive && !isToday && <span style={{ fontSize:10, fontWeight:700, color:'#C8102E', animation:'livePulse 1.4s infinite' }}>● LIVE</span>}
              <span style={{ fontSize:14, fontWeight:700, color:(isToday||hasLive)?'#B45309':'#1E293B' }}>
                {dayNames[day] || day}, {label}
              </span>
              <span style={{ fontSize:11, color:'#94A3B8', marginLeft:'auto' }}>{matches.length} trận{allDone?' · ✓':''}</span>
            </div>

            {matches.map(m => (
              <div key={m.id} style={{ position:'relative' }}>
                <div style={{ position:'absolute', right:44, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'#2563EB', fontWeight:700, zIndex:1, background:'rgba(37,99,235,0.08)', borderRadius:3, padding:'1px 5px', pointerEvents:'none' }}>
                  {m.g}
                </div>
                <MatchCard match={m} result={results[m.id]} onSave={r => onSave(m.id, r)} />
              </div>
            ))}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', color:'#94A3B8', padding:40, fontSize:14 }}>Không tìm thấy trận đấu nào.</div>
      )}
    </div>
  );
}

Object.assign(window, { GroupStageTab, ScheduleTab });
