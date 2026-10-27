import { Logo } from './Frame.jsx'
import { HelpIcon } from './icons.jsx'

export default function AppHeader({ onHelp }) {
  return (
    <header className="absolute left-10 right-[34px] top-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo className="h-14 w-14 rounded-[14px]" />
        <div>
          <p className="text-[24px] font-bold leading-7 tracking-[0.08em]">ABC KIOSK</p>
          <p className="text-[13px] font-medium leading-4 tracking-[0.1em] text-brand">CAMPUS DINING EXPRESS</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onHelp}
        className="flex h-14 items-center gap-3 rounded-2xl bg-panel px-6 text-[18px] font-medium transition active:scale-95"
      >
        <HelpIcon />
        Reset / Help
      </button>
    </header>
  )
}
