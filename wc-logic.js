// FIFA World Cup 2026 — Logic Layer
// Depends on: wc-data.js (TEAMS, GROUPS, GROUP_MATCHES, BRACKET_FLAT)

// ── Live match detection ──────────────────────────────────────────────────────
// A match is "live" if current time is between kickoff and kickoff + 115 min
function isMatchLive(utcStr) {
  const now = Date.now();
  const kick = new Date(utcStr).getTime();
  return now >= kick && now <= kick + 115 * 60 * 1000;
}

// A match is "upcoming soon" (within next 60 min)
function isMatchSoon(utcStr) {
  const now = Date.now();
  const kick = new Date(utcStr).getTime();
  return kick > now && kick <= now + 60 * 60 * 1000;
}
function toVNTime(utcStr) {
  const d = new Date(utcStr);
  const vn = new Date(d.getTime() + 7 * 3600 * 1000);
  const days = ['CN','T2','T3','T4','T5','T6','T7'];
  const p = n => String(n).padStart(2,'0');
  return {
    day:  days[vn.getUTCDay()],
    date: `${p(vn.getUTCDate())}/${p(vn.getUTCMonth()+1)}`,
    time: `${p(vn.getUTCHours())}:${p(vn.getUTCMinutes())}`,
    full: `${days[vn.getUTCDay()]} ${p(vn.getUTCDate())}/${p(vn.getUTCMonth()+1)} ${p(vn.getUTCHours())}:${p(vn.getUTCMinutes())}`,
    isPast: d < new Date(),
  };
}

// ── Group stage standings ─────────────────────────────────────────────────────
function computeStandings(groupCode, results) {
  const teams = GROUPS[groupCode];
  const stats = {};
  teams.forEach(t => {
    stats[t] = { team:t, played:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 };
  });

  GROUP_MATCHES
    .filter(m => m.g === groupCode)
    .forEach(m => {
      const r = results[m.id];
      if (!r || r.h == null || r.a == null) return;
      const hs = r.h, as = r.a;
      stats[m.h].played++; stats[m.a].played++;
      stats[m.h].gf += hs;  stats[m.h].ga += as;
      stats[m.a].gf += as;  stats[m.a].ga += hs;
      if (hs > as) {
        stats[m.h].w++; stats[m.h].pts += 3; stats[m.a].l++;
      } else if (as > hs) {
        stats[m.a].w++; stats[m.a].pts += 3; stats[m.h].l++;
      } else {
        stats[m.h].d++; stats[m.h].pts++;
        stats[m.a].d++; stats[m.a].pts++;
      }
    });

  teams.forEach(t => { stats[t].gd = stats[t].gf - stats[t].ga; });

  return Object.values(stats).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    if (b.gf  !== a.gf)  return b.gf  - a.gf;
    return TEAMS[a.team].rank - TEAMS[b.team].rank; // lower rank # = better FIFA ranking
  });
}

function computeAllStandings(results) {
  const all = {};
  Object.keys(GROUPS).forEach(g => { all[g] = computeStandings(g, results); });
  return all;
}

// ── Best 3rd-place teams ──────────────────────────────────────────────────────
// Rule: pts → GD → GF → FIFA rank (conduct not tracked)
function computeThirdPlace(allStandings) {
  return Object.entries(allStandings)
    .map(([grp, st]) => ({ ...st[2], fromGroup: grp }))
    .filter(t => t && t.played > 0)
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd  !== a.gd)  return b.gd  - a.gd;
      if (b.gf  !== a.gf)  return b.gf  - a.gf;
      return TEAMS[a.team].rank - TEAMS[b.team].rank;
    });
  // Caller takes top 8
}

// ── Knockout bracket resolution ───────────────────────────────────────────────
function resolveSlot(slotDef, allStandings, thirdPlace) {
  if (!slotDef) return null;
  if (slotDef.src === 'grp') {
    const st = allStandings[slotDef.grp];
    return st && st[slotDef.pos - 1] ? st[slotDef.pos - 1].team : null;
  }
  if (slotDef.src === '3rd') {
    if (slotDef.pool) {
      const groups = slotDef.pool.split('');
      const match = thirdPlace.find(t => groups.includes(t.fromGroup));
      return match ? match.team : null;
    }
    return thirdPlace[slotDef.rank - 1]?.team ?? null;
  }
  return null;
}

function getKnockoutWinner(matchId, allStandings, thirdPlace, knockoutResults) {
  const r = knockoutResults[matchId];
  if (!r || r.h == null || r.a == null) return null;
  const { t1, t2 } = resolveKnockoutMatch(matchId, allStandings, thirdPlace, knockoutResults);
  if (r.h > r.a) return t1;
  if (r.a > r.h) return t2;
  if (r.pen === 'h') return t1;
  if (r.pen === 'a') return t2;
  return null;
}

function getKnockoutLoser(matchId, allStandings, thirdPlace, knockoutResults) {
  const winner = getKnockoutWinner(matchId, allStandings, thirdPlace, knockoutResults);
  if (!winner) return null;
  const { t1, t2 } = resolveKnockoutMatch(matchId, allStandings, thirdPlace, knockoutResults);
  return winner === t1 ? t2 : t1;
}

function resolveKnockoutMatch(matchId, allStandings, thirdPlace, knockoutResults) {
  const m = BRACKET_FLAT[matchId];
  if (!m) return { t1: null, t2: null };

  if (m.t1 && m.t2) {
    // R32: teams from group stage
    return {
      t1: resolveSlot(m.t1, allStandings, thirdPlace),
      t2: resolveSlot(m.t2, allStandings, thirdPlace),
    };
  }

  if (m.prev) {
    const fn = m.losers ? getKnockoutLoser : getKnockoutWinner;
    return {
      t1: fn(m.prev[0], allStandings, thirdPlace, knockoutResults),
      t2: fn(m.prev[1], allStandings, thirdPlace, knockoutResults),
    };
  }

  return { t1: null, t2: null };
}

// ── Slot label (when team unknown) ───────────────────────────────────────────
function slotLabel(slotDef) {
  if (!slotDef) return 'TBD';
  if (slotDef.src === 'grp') {
    const pos = ['Nhất','Nhì','Ba'][slotDef.pos - 1] || slotDef.pos;
    return `${pos} Bảng ${slotDef.grp}`;
  }
  if (slotDef.src === '3rd') return `Hạng 3 (${slotDef.pool || '#' + slotDef.rank})`;
  return 'TBD';
}

function prevMatchLabel(matchId) {
  const labels = {
    r32_1:'V32', r32_2:'V32', r32_3:'V32', r32_4:'V32',
    r32_5:'V32', r32_6:'V32', r32_7:'V32', r32_8:'V32',
    r32_9:'V32', r32_10:'V32', r32_11:'V32', r32_12:'V32',
    r32_13:'V32', r32_14:'V32', r32_15:'V32', r32_16:'V32',
    r16_1:'V16', r16_2:'V16', r16_3:'V16', r16_4:'V16',
    r16_5:'V16', r16_6:'V16', r16_7:'V16', r16_8:'V16',
    qf_1:'TK', qf_2:'TK', qf_3:'TK', qf_4:'TK',
    sf_1:'BK', sf_2:'BK',
  };
  return `Thắng ${labels[matchId] || matchId}`;
}
