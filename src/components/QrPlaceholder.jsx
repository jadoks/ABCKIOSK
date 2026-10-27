/*
 * DEMO ONLY: draws a QR-looking square (finder patterns + pseudo-random modules seeded by `seed`).
 * It is NOT scannable. In production, the server returns a real QR Ph payload for this order
 * and you render it with a QR library (e.g. `qrcode`) instead of this component.
 */
const N = 25

function matrix(seed) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 4294967296)
  const finder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
      if (inBox(r0, c0)) {
        const dr = r - r0, dc = c - c0
        return dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4)
      }
      if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return false // quiet zone
    }
    return null
  }
  const cells = []
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const f = finder(r, c)
    if (f === null ? rand() > 0.52 : f) cells.push([r, c])
  }
  return cells
}

export default function QrPlaceholder({ seed = 'abc', className = 'h-[170px] w-[170px]' }) {
  const cells = matrix(seed)
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className={`${className} rounded-[12px] bg-white`} role="img" aria-label="QR Ph code (demo)" shapeRendering="crispEdges">
      {cells.map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0e131b" />)}
    </svg>
  )
}