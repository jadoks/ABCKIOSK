import { ITEMS } from '../data/menu.js'

/* cart = { [itemId]: quantity } -> { count, total, lines } */
export function cartSummary(cart) {
  const lines = ITEMS.filter((i) => cart[i.id] > 0).map((i) => ({ item: i, qty: cart[i.id] }))
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    total: lines.reduce((sum, l) => sum + l.qty * l.item.price, 0),
  }
}

/* Longest prep time in the cart = when the whole order is ready (minutes). */
export const readyMinutes = (lines) => lines.reduce((m, l) => Math.max(m, l.item.ready), 0)

export const ECO_FEE_PER_ITEM = 5 // pesos per item (packaging)
export const SERVICE_FEE = 0 // kiosk fee, free for students

/* Everything the cart / receipt shows: { count, subtotal, ecoFee, serviceFee, total } */
export function orderTotals(lines) {
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.item.price, 0)
  const ecoFee = count * ECO_FEE_PER_ITEM
  return { count, subtotal, ecoFee, serviceFee: SERVICE_FEE, total: subtotal + ecoFee + SERVICE_FEE }
}