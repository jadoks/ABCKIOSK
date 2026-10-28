export const peso = (n) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const mmss = (total) => {
  const s = Math.max(0, total)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// "JUAN DELA CRUZ" -> "Juan C."
export function shortName(full = '') {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  return parts.length > 1 ? `${cap(parts[0])} ${parts[parts.length - 1][0].toUpperCase()}.` : cap(parts[0])
}

// "JUAN DELA CRUZ" -> "Juan Dela Cruz"
export const titleName = (full = '') =>
  full.trim().toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())

// Date -> "10:42 AM"
export function clock(d) {
  const h = d.getHours()
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

// order lines -> "3 Items (Crispy Chicken, Iced Brew)" (first two names, then "+N more")
export function orderSummary(lines = []) {
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const names = lines.slice(0, 2).map((l) => l.name.split(/\s+/).slice(0, 2).join(' ')) // first two words of each name
  const more = lines.length > 2 ? `, +${lines.length - 2} more` : ''
  return `${count} ${count === 1 ? 'Item' : 'Items'} (${names.join(', ')}${more})`
}