import { DEFAULT_POINTS, TIERS } from './config.js'

/* Redeemable perks (Student ID Wallet & Rewards screen). `icon` keys match REWARD_ICONS in icons.jsx. */
export const REWARDS = [
  { id: 'iced-coffee', title: 'Free Iced Coffee', cost: 500, icon: 'cup', desc: '16oz Cold Brew or Sweet Latte at Café Express' },
  { id: 'eco-pack', title: 'Free Eco-Packaging', cost: 150, icon: 'leaf', desc: 'Biodegradable bento kit & reusable cutlery' },
  { id: 'voucher-50', title: '₱50.00 Discount Voucher', cost: 1000, icon: 'ticket', desc: 'Instant deduction on any combo or hot meal' },
  { id: 'large-rice', title: 'Upgrade to Large Rice', cost: 300, icon: 'rice', desc: 'Garlic fried rice or steamed jasmine bowl upgrade' },
]

/* points -> { tier, next, toNext, progress (0..1 toward the top tier) } */
export function tierInfo(points = DEFAULT_POINTS) {
  const tier = [...TIERS].reverse().find((t) => points >= t.min) ?? TIERS[0]
  const next = TIERS.find((t) => t.min > points) ?? null
  const top = TIERS[TIERS.length - 1].min
  return { tier, next, toNext: next ? next.min - points : 0, progress: Math.min(1, points / top), top }
}
