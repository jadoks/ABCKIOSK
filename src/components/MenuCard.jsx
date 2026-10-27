import { useState } from 'react'
import { CATEGORY_ICONS, CheckIcon, MinusIcon, PlusIcon } from './icons.jsx'
import { peso } from '../lib/format.js'

const PLACEHOLDER_ICON = { rice: 'rice', sandwiches: 'sandwich', drinks: 'cup' }

export default function MenuCard({ item, qty, onAdd, onChange, hidden = false }) {
  // photo (.jpg) -> illustrated fallback (.svg) -> icon
  const [src, setSrc] = useState(item.image)
  const [imgFailed, setImgFailed] = useState(false)
  const onImgError = () => (src !== item.fallback && item.fallback ? setSrc(item.fallback) : setImgFailed(true))
  const Placeholder = CATEGORY_ICONS[PLACEHOLDER_ICON[item.category]] ?? CATEGORY_ICONS.grid

  return (
    <article className={`flex-col rounded-[20px] bg-[#161c27] p-4 ${hidden ? 'hidden' : 'flex'}`}>
      <div className="relative h-[168px] overflow-hidden rounded-[14px] bg-gradient-to-br from-[#1f2d3e] to-[#111824]">
        {imgFailed ? (
          <div className="grid h-full place-items-center text-[#3a4b63]">
            <Placeholder className="h-16 w-16" />
          </div>
        ) : (
          <img
            src={src}
            alt={item.name}
            decoding="async"
            draggable={false}
            onError={onImgError}
            className="h-full w-full object-cover"
          />
        )}
        <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-4 py-1.5 text-[20px] font-bold">{peso(item.price)}</span>
      </div>

      <h3 className="mt-4 text-[22px] font-semibold leading-7">{item.name}</h3>
      <p className="mt-1 text-[15px] font-medium text-brand">Ready in {item.ready}m • {item.cals} cals</p>
      <p className="mt-3 flex-1 font-body text-[19px] leading-6 text-muted">{item.desc}</p>

      <div className="mt-4 flex gap-3">
        {qty === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#09b4d6] text-[22px] font-semibold text-[#05303b] transition active:scale-[0.98]"
          >
            <PlusIcon /> Add to Order
          </button>
        ) : (
          <>
            <div className="flex h-[58px] items-center rounded-[12px] border border-[#2b3342] bg-ink p-1">
              <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onChange(qty - 1)}
                className="grid h-[48px] w-[48px] place-items-center rounded-[9px] bg-key transition active:scale-95"><MinusIcon /></button>
              <span className="w-[44px] text-center text-[22px] font-semibold text-brand">{qty}</span>
              <button type="button" aria-label={`Add one more ${item.name}`} onClick={() => onChange(qty + 1)}
                className="grid h-[48px] w-[48px] place-items-center rounded-[9px] bg-key transition active:scale-95"><PlusIcon /></button>
            </div>
            <div className="flex h-[58px] flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#10b392] text-[20px] font-semibold text-[#04332a]">
              <CheckIcon className="h-5 w-5" fill="#04332a" tick="#10b392" /> {qty} Added
            </div>
          </>
        )}
      </div>
    </article>
  )
}