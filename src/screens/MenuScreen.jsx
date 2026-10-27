import { useState } from 'react'
import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import MenuCard from '../components/MenuCard.jsx'
import useDragScroll from '../hooks/useDragScroll.js'
import { ArrowIcon, BagIcon, CATEGORY_ICONS, MedalIcon, SlidersIcon } from '../components/icons.jsx'
import { CATEGORIES, ITEMS } from '../data/menu.js'
import { cartSummary } from '../lib/cart.js'
import { peso } from '../lib/format.js'

const MAX_QTY = 9

function CategoryButton({ cat, count, active, onSelect }) {
  const Icon = CATEGORY_ICONS[cat.icon]
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex h-[84px] w-full items-center gap-4 rounded-[16px] px-4 text-left transition active:scale-[0.98] ${
        active ? 'border-2 border-brand bg-[#0f2c3a]' : 'border border-transparent bg-[#171d28]'
      }`}
    >
      <span className={`grid h-[52px] w-[52px] flex-none place-items-center rounded-[13px] ${active ? 'bg-brand text-[#06323f]' : 'bg-key text-[#aab1c0]'}`}>
        <Icon />
      </span>
      <span>
        <span className={`block text-[22px] font-semibold leading-6 ${active ? 'text-brand' : 'text-soft'}`}>{cat.label}</span>
        <span className="block text-[13px] font-medium text-muted">{cat.sub ?? `${count} Selections`}</span>
      </span>
    </button>
  )
}

export default function MenuScreen({ student, cart, onCartChange, onLogOut, onCheckout }) {
  const [category, setCategory] = useState('all')
  const listRef = useDragScroll() // drag the item list with a finger or mouse

  const pickCategory = (id) => {
    setCategory(id)
    listRef.current?.scrollTo({ top: 0 })
  }

  const { count, total } = cartSummary(cart)

  const setQty = (id, qty) => {
    const next = { ...cart }
    const clamped = Math.max(0, Math.min(MAX_QTY, qty))
    if (clamped === 0) delete next[id]
    else next[id] = clamped
    onCartChange(next)
  }

  return (
    <Frame>
      <AppHeader onHelp={onLogOut} />
      <SessionBar student={student} cart={cart} onLogOut={onLogOut} />

      <div className="absolute left-9 right-9 top-[240px] flex h-[1000px] gap-[18px]">
        {/* Categories */}
        <aside className="flex w-[280px] flex-none flex-col pt-[28px]">
          <div className="mb-[18px] flex items-center justify-between px-1 text-muted">
            <span className="text-[12px] font-semibold tracking-[0.08em]">MENU CATEGORIES</span>
            <SlidersIcon />
          </div>
          <nav className="flex flex-col gap-[14px]" aria-label="Menu categories">
            {CATEGORIES.map((c) => (
              <CategoryButton key={c.id} cat={c} count={ITEMS.length} active={category === c.id} onSelect={() => pickCategory(c.id)} />
            ))}
          </nav>
          <div className="mt-auto flex h-[50px] items-center justify-center gap-2 rounded-[12px] border border-[#222a38] bg-[#121722] text-[16px] font-semibold text-amber">
            <MedalIcon /> Meal Points Active
          </div>
        </aside>

        {/* Items */}
        <section
          ref={listRef}
          aria-label="Menu items"
          className="grid flex-1 touch-pan-y overscroll-contain auto-rows-min grid-cols-2 content-start gap-4 overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Every card stays mounted and is only hidden, so photos aren't re-loaded or re-decoded on each category tap. */}
          {ITEMS.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              hidden={category !== 'all' && item.category !== category}
              qty={cart[item.id] ?? 0}
              onAdd={() => setQty(item.id, 1)}
              onChange={(q) => setQty(item.id, q)}
            />
          ))}
        </section>
      </div>

      {/* Cart bar */}
      <div className="absolute left-0 right-0 top-[1255px] h-[120px] bg-[#121722] px-[18px] py-[14px]">
        <div className="flex h-full items-center gap-6 rounded-[18px] border border-[#222a38] bg-[#161c27] px-7">
          <span className="grid h-[62px] w-[62px] flex-none place-items-center rounded-[14px] bg-[#0f3a4a]"><BagIcon /></span>
          <div className="flex-1">
            <p className="text-[26px] font-semibold leading-8">
              Current Order: <span className="text-brand">{count} {count === 1 ? 'Item' : 'Items'}</span>
            </p>
            <p className="text-[18px] text-muted">Subtotal: {peso(total)}</p>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={count === 0}
            className="flex h-[60px] w-[446px] items-center justify-center gap-3 rounded-[12px] bg-[#09b4d6] text-[24px] font-semibold text-[#05303b] transition active:scale-[0.98] disabled:opacity-40"
          >
            View Cart &amp; Checkout ({peso(total)}) <ArrowIcon />
          </button>
        </div>
      </div>
    </Frame>
  )
}