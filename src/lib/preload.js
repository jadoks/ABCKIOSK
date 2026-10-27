import { ITEMS } from '../data/menu.js'

const keep = [] // hold references so the browser keeps the decoded images

/* Loads and decodes every menu photo in the background (call once at startup, e.g. while the Welcome screen shows). */
export function preloadMenuImages() {
  if (keep.length) return
  for (const item of ITEMS) {
    const load = (src, onFail) => {
      const im = new Image()
      im.decoding = 'async'
      im.src = src
      keep.push(im)
      im.decode?.().catch(() => onFail?.()) // decode() rejects on 404 / bad file
    }
    load(item.image, () => item.fallback && load(item.fallback))
  }
}