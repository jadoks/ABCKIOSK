/*
 * Draws simple illustrated stand-ins for every menu item -> public/images/menu/<file>.svg
 * No internet or API key needed:  npm run art
 * The app shows <file>.jpg (real photo) when it exists, otherwise falls back to this <file>.svg.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const OUT = fileURLToPath(new URL('../public/images/menu/', import.meta.url))

const bg = (glow) => `
<defs>
  <radialGradient id="bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#2a3646"/><stop offset="1" stop-color="#0f1520"/></radialGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${glow}" stop-opacity=".35"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/><ellipse cx="400" cy="330" rx="380" ry="260" fill="url(#glow)"/>`

const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".35"/>`
const plate = (cx = 400, cy = 330, r = 230) => `
  ${shadow(cx + 10, cy + 40, r, r * 0.42)}
  <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.55}" fill="#e8ebf0"/>
  <ellipse cx="${cx}" cy="${cy - 6}" rx="${r * 0.82}" ry="${r * 0.43}" fill="#d3d8e0"/>`

const rice = (cx, cy, n = 46) => {
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="150" ry="62" fill="#f4efe2"/>`
  for (let i = 0; i < n; i++) {
    const a = (i * 137.5 * Math.PI) / 180, d = Math.sqrt(i / n)
    s += `<ellipse cx="${cx + Math.cos(a) * 130 * d}" cy="${cy - 14 + Math.sin(a) * 40 * d}" rx="14" ry="6" fill="#fffaf0" transform="rotate(${(i * 37) % 180} ${cx + Math.cos(a) * 130 * d} ${cy - 14 + Math.sin(a) * 40 * d})"/>`
  }
  return s
}
const egg = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="62" ry="34" fill="#fff"/><ellipse cx="${cx - 6}" cy="${cy - 4}" rx="24" ry="17" fill="#ffb81f"/><ellipse cx="${cx - 12}" cy="${cy - 10}" rx="7" ry="4" fill="#ffe08a"/>`
const dots = (cx, cy, rx, ry, n, colors, size = [7, 12]) => {
  let s = ''
  for (let i = 0; i < n; i++) {
    const a = i * 2.399, d = Math.sqrt((i + 0.5) / n)
    s += `<circle cx="${(cx + Math.cos(a) * rx * d).toFixed(1)}" cy="${(cy + Math.sin(a) * ry * d).toFixed(1)}" r="${size[0] + ((i * 7) % (size[1] - size[0] + 1))}" fill="${colors[i % colors.length]}"/>`
  }
  return s
}

const cup = ({ liquid, top = '#00000000', ice = true, straw = '#44d4f7', swirl, slices }) => `
  ${shadow(400, 530, 150, 28)}
  <path d="M290 150 L510 150 L482 520 Q480 540 460 540 L340 540 Q320 540 318 520 Z" fill="#ffffff" opacity=".16"/>
  <path d="M300 200 L500 200 L476 515 Q474 530 458 530 L342 530 Q326 530 324 515 Z" fill="${liquid}"/>
  <rect x="300" y="200" width="200" height="${top === '#00000000' ? 0 : 60}" fill="${top}" opacity=".9"/>
  ${swirl ?? ''}
  ${ice ? [[350, 250], [430, 270], [380, 330], [455, 340], [340, 410], [420, 420]].map(([x, y], i) => `<rect x="${x - 30}" y="${y - 30}" width="60" height="60" rx="10" fill="#fff" opacity=".28" transform="rotate(${i * 17 - 20} ${x} ${y})"/>`).join('') : ''}
  ${slices ?? ''}
  <rect x="283" y="140" width="234" height="20" rx="8" fill="#e8ebf0" opacity=".85"/>
  <path d="M430 150 L470 40" stroke="${straw}" stroke-width="16" stroke-linecap="round"/>
  <path d="M318 190 L335 500" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".25"/>`

const slice = (x, y, rot, c1, c2) => `<g transform="rotate(${rot} ${x} ${y})"><circle cx="${x}" cy="${y}" r="26" fill="${c1}"/><circle cx="${x}" cy="${y}" r="19" fill="${c2}"/></g>`

const bread = (x, y, w, h, c = '#d9a05b') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${c}"/><rect x="${x + 8}" y="${y + 6}" width="${w - 16}" height="${h - 14}" rx="12" fill="#efc88a"/>`
const layer = (x, y, w, h, c, wave = false) =>
  wave
    ? `<path d="M${x} ${y} q${w / 8} -${h} ${w / 4} 0 t${w / 4} 0 t${w / 4} 0 t${w / 4} 0 v${h * 0.6} h-${w} z" fill="${c}"/>`
    : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/>`

const triSandwich = (cx, cy, fillings, rot = 0) => {
  const w = 230, h = 40
  let y = cy, s = `<g transform="rotate(${rot} ${cx} ${cy})">${bread(cx - w / 2, y + fillings.length * 22 + 10, w, h)}`
  fillings.forEach((f, i) => { s += layer(cx - w / 2 - 6, cy + (fillings.length - 1 - i) * 22 + 6, w + 12, 18, f, i % 2 === 0) })
  return s + bread(cx - w / 2, cy - 30, w, h) + '</g>'
}

const ART = {
  'crispy-chicken-fillet-meal': { glow: '#ff9f43', svg: `${plate()}${rice(360, 340)}
    <path d="M360 300 Q420 250 520 290 Q560 330 500 370 Q430 390 380 360 Z" fill="#8a4b1c" opacity=".8"/>
    ${[0, 1, 2].map((i) => `<rect x="${380 + i * 45}" y="${265 + i * 10}" width="120" height="58" rx="22" fill="#e0952f" transform="rotate(${-12 + i * 6} ${440 + i * 45} ${295 + i * 10})"/><rect x="${392 + i * 45}" y="${272 + i * 10}" width="96" height="38" rx="16" fill="#f4b94d" transform="rotate(${-12 + i * 6} ${440 + i * 45} ${295 + i * 10})"/>`).join('')}
    ${dots(480, 330, 90, 25, 8, ['#4caf50'], [4, 5])}` },
  'beef-tapa-egg-bowl': { glow: '#ff7043', svg: `${plate(400, 340, 220)}${rice(400, 350)}
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${300 + i * 36}" y="${300 + (i % 2) * 22}" width="86" height="22" rx="10" fill="#7a2f17" transform="rotate(${-25 + i * 14} ${343 + i * 36} ${311 + (i % 2) * 22})"/>`).join('')}
    ${egg(430, 300)}${dots(350, 360, 60, 16, 12, ['#d99a3c'], [4, 6])}` },
  'sizzling-sisig-bowl': { glow: '#ff8a3d', svg: `${shadow(410, 400, 250, 60)}
    <ellipse cx="400" cy="340" rx="250" ry="130" fill="#2b2f38"/><ellipse cx="400" cy="325" rx="226" ry="112" fill="#3a3f4b"/>${rice(400, 330)}
    ${dots(400, 315, 120, 40, 60, ['#c4743a', '#a85a28', '#e2a15d', '#7a3a1a'], [8, 13])}
    ${dots(400, 310, 110, 36, 12, ['#d32f2f', '#4caf50'], [4, 6])}${egg(400, 295)}` },
  'tuna-melt-panini': { glow: '#ffc107', svg: `${plate()}
    <g transform="rotate(-8 330 330)">${bread(220, 270, 240, 110, '#c98f4a')}<rect x="230" y="318" width="220" height="22" fill="#ffc83d"/><rect x="236" y="340" width="208" height="16" fill="#d9c9b0"/>
    <path d="M222 330 q30 12 60 0 t60 0 t60 0 t50 0" stroke="#8a5a22" stroke-width="5" fill="none"/></g>
    <g transform="rotate(14 520 340)">${bread(430, 290, 200, 100, '#c98f4a')}<rect x="440" y="336" width="180" height="20" fill="#ffc83d"/></g>
    <ellipse cx="570" cy="410" rx="55" ry="22" fill="#cfd5de"/>${dots(570, 404, 40, 12, 10, ['#d9c9b0', '#bfae92'], [6, 9])}` },
  'clubhouse-sandwich': { glow: '#ffa726', svg: `${plate()}${triSandwich(340, 250, ['#e53935', '#6dbf47', '#fff3c4', '#b4503a'], -6)}${triSandwich(500, 270, ['#e53935', '#6dbf47', '#fff3c4', '#b4503a'], 8)}
    ${dots(400, 440, 80, 18, 16, ['#f2c14e', '#e7ac2d'], [6, 9])}` },
  'grilled-cheese-toast': { glow: '#ffca28', svg: `${plate()}${bread(250, 290, 200, 130, '#c98f4a')}${bread(370, 250, 210, 130, '#c98f4a')}
    <path d="M370 330 q10 60 26 70 q8 -36 20 -52 q20 40 28 40 q6 -20 4 -60 z" fill="#ffc83d"/>
    <path d="M300 345 q-6 50 10 66 q10 -28 18 -40 z" fill="#ffd966"/>
    <ellipse cx="560" cy="430" rx="46" ry="18" fill="#cfd5de"/><ellipse cx="560" cy="426" rx="34" ry="11" fill="#b5301f"/>` },
  'chicken-caesar-wrap': { glow: '#8bc34a', svg: `${plate()}
    ${[[290, 290, -14], [450, 310, 10]].map(([x, y, r]) => `<g transform="rotate(${r} ${x + 90} ${y + 40})"><rect x="${x}" y="${y}" width="180" height="96" rx="46" fill="#e9cf9b"/><ellipse cx="${x + 160}" cy="${y + 48}" rx="30" ry="44" fill="#f5e6c0"/><path d="M${x + 140} ${y + 20} q30 28 0 56" fill="#6dbf47"/>${dots(x + 160, y + 48, 18, 28, 6, ['#f1c27d', '#fff', '#6dbf47'], [5, 8])}</g>`).join('')}
    <path d="M280 410 q120 40 260 0" stroke="#c9a96a" stroke-width="10" fill="none" opacity=".35"/>` },
  'iced-caramel-brew': { glow: '#d98f4e', svg: cup({ liquid: '#6b3d1f', top: '#f3e3c8', swirl: `<path d="M312 230 q40 40 80 0 t90 20" stroke="#e29b3d" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M320 300 q40 -30 80 10 t80 -10" stroke="#e9c9a0" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>`, straw: '#e29b3d' }) },
  'cold-brew-coffee': { glow: '#8d6e63', svg: cup({ liquid: '#1d1209', straw: '#cfd5de' }) },
  'matcha-oat-latte': { glow: '#7cb342', svg: cup({ liquid: '#f2ede0', top: '#7da53a', swirl: `<path d="M300 260 q50 40 100 0 t100 14 L490 330 L310 330 Z" fill="#8fbf4a"/><rect x="300" y="320" width="200" height="90" fill="#f2ede0" opacity="0"/>`, straw: '#7da53a' }) },
  'fruity-iced-tea': { glow: '#ff7043', svg: cup({ liquid: '#b85d1a', straw: '#6dbf47', slices: `${slice(370, 300, 0, '#ffa726', '#ffcc80')}${slice(440, 360, 30, '#fdd835', '#fff59d')}${slice(380, 430, 10, '#c2185b', '#f06292')}<path d="M470 150 q30 -50 70 -40 q-10 40 -40 50 z" fill="#4caf50"/><path d="M470 150 q-10 -50 -50 -50 q0 40 30 55 z" fill="#66bb6a"/>` }) },
}

await mkdir(OUT, { recursive: true })
for (const [file, { glow, svg }] of Object.entries(ART)) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${file.replace(/-/g, ' ')}">${bg(glow)}${svg}</svg>\n`
  await writeFile(path.join(OUT, `${file}.svg`), xml)
  console.log('wrote', `${file}.svg`)
}
