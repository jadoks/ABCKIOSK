import Frame, { Logo } from '../components/Frame.jsx'

function IdCardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 flex-none text-brand" fill="currentColor" aria-hidden="true">
      <path d="M9 2h6v4H9z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M4 6a2 2 0 0 1 2-2h1v3h10V4h1a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.5 20c0-1.7 1.1-3 2.5-3s2.5 1.3 2.5 3h-5Zm7-6h4v1.5h-4V14Zm0 3h4v1.5h-4V17Z" />
    </svg>
  )
}

function Chip({ children }) {
  return (
    <span className="inline-flex h-[34px] items-center rounded-full bg-panel px-[14px] text-[17px] font-medium text-muted">
      {children}
    </span>
  )
}

export default function WelcomeScreen({ onStart }) {
  return (
    <Frame
      className="flex flex-col items-center pt-[112px] text-center"
      onClick={onStart}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onStart()}
      role="button"
      tabIndex={0}
      aria-label="Tap anywhere to start"
    >
      <header className="flex h-[54px] items-center gap-4 whitespace-nowrap rounded-full bg-panel px-[30px] text-[24px] font-medium tracking-[0.04em]">
        <span className="h-4 w-4 rounded-full bg-mint" />
        ABC KIOSK • SELF-SERVICE TERMINAL
      </header>

      <div className="mt-[59px] grid h-[146px] w-[146px] place-items-center rounded-[34px] bg-[#151b24] shadow-[0_0_60px_rgba(68,212,247,0.22)]">
        <Logo className="h-[118px] w-[118px] rounded-[22px]" />
      </div>

      <h2 className="mt-[113px] text-[48px] font-semibold leading-none tracking-tight">ABC KIOSK</h2>
      <p className="mt-3 text-[22px] font-medium leading-none tracking-[0.1em] text-brand">CAMPUS DINING EXPRESS</p>

      <h1 className="mt-[19px] text-[72px] font-semibold leading-[80px] tracking-[-0.02em]">
        Hungry?
        <span className="block text-brand">Skip the Line.</span>
      </h1>

      <div className="mt-[34px] flex flex-col items-center gap-5">
        <Chip>Instant Student ID Tap</Chip>
        <div className="flex gap-[26px]">
          <Chip>Fresh Pre-Orders</Chip>
          <Chip>Zero Wait Pickup</Chip>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onStart() }}
        className="mt-[46px] h-[88px] w-[395px] animate-glow rounded-[22px] bg-brand text-[30px] font-semibold text-[#073242] transition-transform active:scale-95 motion-reduce:animate-none"
      >
        Tap Anywhere To Start
      </button>

      <div className="mt-[74px] flex h-[71px] w-[746px] items-center justify-center gap-[24px] rounded-[22px] bg-panel-2 font-body text-[28px] leading-none">
        <IdCardIcon />
        Please have your Student ID ready.
      </div>
    </Frame>
  )
}