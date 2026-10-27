/*
 * Generates the real menu photos from scripts/menu-prompts.json (same prompts as IMAGES.md).
 *
 *   OPENAI_API_KEY=sk-... npm run images             # only creates photos that don't exist yet
 *   OPENAI_API_KEY=sk-... npm run images -- --force  # regenerate everything
 *   OPENAI_API_KEY=sk-... npm run images -- chicken  # only files whose name contains "chicken"
 *
 * Output: public/images/menu/<file>.jpg. Needs Node 18+. Run it on your own machine (needs internet).
 * Change MODEL / SIZE below to use a different image model.
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const MODEL = 'gpt-image-1'
const SIZE = '1536x1024' // 3:2, the card crops it to fit (object-cover)
const OUT = fileURLToPath(new URL('../public/images/menu/', import.meta.url))
const { style, items } = JSON.parse(await readFile(new URL('./menu-prompts.json', import.meta.url), 'utf8'))

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('Set OPENAI_API_KEY first.  Example: OPENAI_API_KEY=sk-... npm run images')
  process.exit(1)
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const filter = args.find((a) => !a.startsWith('--'))
const exists = (p) => access(p).then(() => true, () => false)

await mkdir(OUT, { recursive: true })

for (const { file, prompt } of items) {
  if (filter && !file.includes(filter)) continue
  const target = path.join(OUT, `${file}.jpg`)
  if (!force && (await exists(target))) {
    console.log(`skip   ${file}.jpg (already exists)`)
    continue
  }
  process.stdout.write(`make   ${file}.jpg ... `)
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      prompt: `${prompt}. ${style}`,
      size: SIZE,
      quality: 'medium',
      output_format: 'jpeg',
      output_compression: 80, // keeps files small
      n: 1,
    }),
  })
  if (!res.ok) {
    console.log(`FAILED (${res.status}) ${(await res.text()).slice(0, 200)}`)
    continue
  }
  const { data } = await res.json()
  await writeFile(target, Buffer.from(data[0].b64_json, 'base64'))
  console.log('ok')
}
console.log('Done. Tip: if any file is over ~200 KB, re-save it smaller (e.g. squoosh.app).')
