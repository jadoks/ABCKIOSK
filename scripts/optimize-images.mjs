/*
 * Shrinks the menu photos so the kiosk loads and scrolls fast.
 *
 *   npm install        (once, installs "sharp")
 *   npm run optimize
 *
 * 1) public/images/menu/*.jpg : resize to 800x600 (cropped to fit), re-compress to under ~150 KB.
 * 2) public/images/logo.png    : stays a PNG (keeps transparency), shrunk to fit 256x256 and compressed to under ~60 KB.
 * Your big originals are copied first to  images-original/  (outside public/, never shipped).
 * Safe to run again: files that are already small are skipped.
 */
import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const DIR = fileURLToPath(new URL('../public/images/menu/', import.meta.url))
const BACKUP = fileURLToPath(new URL('../images-original/', import.meta.url))
const W = 800, H = 600
const MAX_BYTES = 150 * 1024

const LOGO = fileURLToPath(new URL('../public/images/logo.png', import.meta.url))
const LOGO_MAX = 256 // shown at most ~118px on screen; 256 stays sharp on high-DPI kiosk screens
const LOGO_MAX_BYTES = 60 * 1024

const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f))
if (!files.length) console.log('No .jpg files found in public/images/menu/')
await mkdir(BACKUP, { recursive: true })

let before = 0, after = 0
for (const f of files) {
  const file = path.join(DIR, f)
  const size = (await stat(file)).size
  const meta = await sharp(file).metadata()
  before += size
  if (size <= MAX_BYTES && meta.width <= W && meta.height <= H) {
    after += size
    console.log(`skip  ${f} (${Math.round(size / 1024)} KB, already small)`)
    continue
  }
  await copyFile(file, path.join(BACKUP, f)) // keep the original
  const src = path.join(BACKUP, f)
  let out
  for (let q = 80; q >= 40; q -= 8) {
    out = await sharp(src)
      .rotate() // respect phone orientation
      .resize(W, H, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer()
    if (out.length <= MAX_BYTES) break
  }
  await writeFile(file, out)
  after += out.length
  console.log(`ok    ${f}: ${Math.round(size / 1024)} KB -> ${Math.round(out.length / 1024)} KB`)
}
if (files.length) console.log(`\nMenu photos: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`)

/* ---------- logo.png ---------- */
const logoSize = await stat(LOGO).then((s) => s.size).catch(() => null)
if (logoSize === null) {
  console.log('\nNo public/images/logo.png found, skipping logo.')
} else {
  const meta = await sharp(LOGO).metadata()
  if (logoSize <= LOGO_MAX_BYTES && meta.width <= LOGO_MAX && meta.height <= LOGO_MAX) {
    console.log(`\nskip  logo.png (${Math.round(logoSize / 1024)} KB, already small)`)
  } else {
    const backup = path.join(BACKUP, 'logo.png')
    await copyFile(LOGO, backup) // keep the original
    const out = await sharp(backup)
      .resize(LOGO_MAX, LOGO_MAX, { fit: 'inside', withoutEnlargement: true }) // never crops, never upscales
      .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }) // still PNG, transparency kept
      .toBuffer()
    await writeFile(LOGO, out)
    console.log(`\nok    logo.png: ${Math.round(logoSize / 1024)} KB -> ${Math.round(out.length / 1024)} KB (${meta.width}x${meta.height} -> fits ${LOGO_MAX}x${LOGO_MAX})`)
  }
}
