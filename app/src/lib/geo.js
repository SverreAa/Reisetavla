// Geometri: Googles polyline-koding (Entur pointsOnLink), avstander og projeksjon på linjer.
export function decodePolyline(str) {
  if (!str) return [];
  let i = 0, lat = 0, lon = 0;
  const out = [];
  while (i < str.length) {
    let b, shift = 0, res = 0;
    do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += res & 1 ? ~(res >> 1) : res >> 1;
    shift = 0; res = 0;
    do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lon += res & 1 ? ~(res >> 1) : res >> 1;
    out.push([lat / 1e5, lon / 1e5]);
  }
  return out;
}

const R = 6371000, rad = (x) => (x * Math.PI) / 180;
export function dist(a, b) {
  const dl = rad(b[0] - a[0]), dn = rad(b[1] - a[1]);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Nærmeste punkt på en linje: { index (segment), t (0–1), point, d }
export function project(line, p) {
  let best = { index: 0, t: 0, point: line[0], d: Infinity };
  const kx = Math.cos(rad(p[0]));
  for (let i = 0; i < line.length - 1; i++) {
    const A = line[i], B = line[i + 1];
    const ax = A[1] * kx, ay = A[0], bx = B[1] * kx, by = B[0], px = p[1] * kx, py = p[0];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const q = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
    const d = dist(q, p);
    if (d < best.d) best = { index: i, t, point: q, d };
  }
  return best;
}

// Del en linje ved et punkt: [før, etter]
export function splitAt(line, p) {
  if (!line || line.length < 2) return [line || [], line || []];
  const pr = project(line, p);
  const before = line.slice(0, pr.index + 1).concat([pr.point]);
  const after = [pr.point].concat(line.slice(pr.index + 1));
  return [before, after];
}

export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
