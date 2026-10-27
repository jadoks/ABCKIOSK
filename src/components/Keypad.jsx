import { BackspaceIcon } from './icons.jsx'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

function Key({ value, onPress }) {
  const common = 'h-[64px] rounded-[14px] transition active:scale-95'
  if (value === 'clear')
    return (
      <button type="button" onClick={onPress} className={`${common} bg-[#ffb85c] text-[20px] font-bold tracking-[0.04em] text-[#4a2a00] active:bg-[#f0a444]`}>
        CLEAR
      </button>
    )
  if (value === 'back')
    return (
      <button type="button" onClick={onPress} aria-label="Delete last digit" className={`${common} grid place-items-center bg-key text-soft active:bg-[#2f3748]`}>
        <BackspaceIcon />
      </button>
    )
  return (
    <button type="button" onClick={onPress} className={`${common} bg-key text-[36px] font-medium active:bg-[#2f3748]`}>
      {value}
    </button>
  )
}

/* onPress receives '0'-'9', 'clear' or 'back'. className sets margin/gap. */
export default function Keypad({ onPress, className = 'gap-3' }) {
  return (
    <div className={`grid grid-cols-3 ${className}`}>
      {KEYS.map((k) => <Key key={k} value={k} onPress={() => onPress(k)} />)}
    </div>
  )
}
