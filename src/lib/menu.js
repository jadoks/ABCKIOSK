/*
 * Live menu. ITEMS and CATEGORIES start as the hardcoded list in data/menu.js (so the app still
 * shows something if the server is down) and are replaced IN PLACE by loadMenu() with the real
 * menu from GET /api/menu. Because the arrays are mutated, every file that imports them sees the update.
 */
import { CATEGORIES as STATIC_CATEGORIES, ITEMS as STATIC_ITEMS } from '../data/menu.js'
import { api } from './api.js'

export const CATEGORIES = [...STATIC_CATEGORIES]
export const ITEMS = [...STATIC_ITEMS]

const staticById = Object.fromEntries(STATIC_ITEMS.map((i) => [i.id, i]))
const ALL = STATIC_CATEGORIES.find((c) => c.id === 'all') ?? { id: 'all', label: 'All Items', sub: null, icon: 'grid' }

export async function loadMenu() {
  const menu = await api.get('/api/menu')
  const items = menu.items.map((i) => {
    const local = staticById[i.id] // only used for the illustrated .svg fallback / short text
    return {
      id: i.id,
      category: i.category,
      name: i.name,
      desc: i.description,
      price: i.price,
      ready: i.ready,
      cals: i.cals,
      image: `/images/menu/${i.image}.jpg`,
      fallback: local?.fallback,
      short: local?.short,
    }
  })
  const categories = menu.categories.map((c) => ({ id: c.id, label: c.label, sub: c.sub, icon: c.icon }))
  ITEMS.splice(0, ITEMS.length, ...items)
  CATEGORIES.splice(0, CATEGORIES.length, ALL, ...categories)
}
