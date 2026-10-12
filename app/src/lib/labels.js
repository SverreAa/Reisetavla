// Plassering av stoppmerkelapper på kartet (skjermkoordinater).
// Prøver sidene i rekkefølge og velger den med minst overlapp med andre merkelapper,
// reiselinjen og brukerens posisjon, og som holder seg innenfor synlig kartflate.
const BOX = {
  tl: (x, y, w, h) => [x - 8 - w, y - 8 - h], tr: (x, y, w, h) => [x + 8, y - 8 - h],
  bl: (x, y, w, h) => [x - 8 - w, y + 8], br: (x, y, w, h) => [x + 8, y + 8],
  l: (x, y, w, h) => [x - 12 - w, y - h / 2], r: (x, y, w, h) => [x + 12, y - h / 2],
  t: (x, y, w, h) => [x - w / 2, y - 12 - h], b: (x, y, w, h) => [x - w / 2, y + 12],
};
const ORDER = ['tr', 'br', 'tl', 'bl', 'r', 'l', 't', 'b'];
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

// lines: arrays of {x,y} screen points; me: {x,y}
export function makeObstacles(lines, me) {
  const out = [];
  lines.forEach((pts) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const A = pts[k], B = pts[k + 1];
      const n = Math.max(1, Math.ceil(Math.hypot(B.x - A.x, B.y - A.y) / 10));
      for (let j = 0; j <= n; j++) out.push({ x: A.x + ((B.x - A.x) * j) / n - 5, y: A.y + ((B.y - A.y) * j) / n - 5, w: 10, h: 10, wt: 1 });
    }
  });
  if (me) out.push({ x: me.x - 16, y: me.y - 16, w: 32, h: 32, wt: 50 });
  return out;
}

// items i prioritert rekkefølge. Får en merkelapp ingen plass uten å overlappe en annen
// (eller havne utenfor kartflaten), skjules den (hidden: true) i stedet for å legges oppå.
export function placeAll(items, obstacles, bound) {
  const placed = [];
  return items.map((it) => {
    // Bare plasseringer uten overlapp med andre merkelapper og innenfor kartflaten er lovlige;
    // blant dem vinner den som dekker minst av reiselinjen og posisjonen.
    let best = null, bestScore = Infinity;
    ORDER.forEach((side, idx) => {
      const [bx, by] = BOX[side](it.x, it.y, it.w, it.h);
      const bb = { x: bx, y: by, w: it.w, h: it.h };
      const oob = Math.max(0, bound.l - bx) + Math.max(0, bx + it.w - bound.r) + Math.max(0, bound.t - by) + Math.max(0, by + it.h - bound.b);
      const clash = placed.some((p) => overlap(p, bb) > 0);
      if (oob > 0 || clash) return;
      const score = obstacles.reduce((s, o) => s + overlap(o, bb) * o.wt, 0) + idx;
      if (score < bestScore) { bestScore = score; best = bb; }
    });
    if (!best && it.force) {
      // Merker som alltid skal vises (billettkontroll): beste plass selv om den overlapper
      ORDER.forEach((side) => { const [bx, by] = BOX[side](it.x, it.y, it.w, it.h); const bb = { x: bx, y: by, w: it.w, h: it.h }; const sc = placed.reduce((s, p) => s + overlap(p, bb), 0); if (!best || sc < bestScore) { bestScore = sc; best = bb; } });
    }
    if (!best) return { ...it, hidden: true };
    placed.push(best);
    return { ...it, bx: best.x, by: best.y };
  });
}

export const labelWidth = (kind, name, meta) => Math.ceil(Math.max(kind.length * 7.4 + 13, name.length * 7.7, meta.length * 6.6)) + 20;
