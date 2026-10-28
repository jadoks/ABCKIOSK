import { useEffect, useState } from 'react'

// The Figma frame size. Every screen is built at this size and scaled to fit the display.
export const DESIGN_W = 1034
export const DESIGN_H = 1448

function useFitScale() {
  const calc = () => Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const onResize = () => setScale(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

export function NfcIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-mint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 8.5a5 5 0 0 1 0 7M12.5 7a7.5 7.5 0 0 1 0 10M7 10.5a2.5 2.5 0 0 1 0 3" />
    </svg>
  )
}

/* ABC Kiosk logo: public/images/logo.png (replace that file to change the logo everywhere).
   Falls back to the built-in vector logo if the PNG is missing. */
const LOGO_SRC = `${import.meta.env.BASE_URL}images/logo.png`

function FallbackLogo({ className }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="ABC Kiosk logo">
      <rect width="120" height="120" fill="#44D4F7" />
      <circle cx="60" cy="60" r="50" fill="#0A1E2B" stroke="#0A5E78" strokeWidth="3" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#44D4F7" strokeWidth="2" />
      <path d="M42 48c-4-8 2-15 9-14 3-7 15-7 18 0 8-1 13 6 9 14z" fill="#44D4F7" />
      <ellipse cx="60" cy="56" rx="17" ry="5" fill="#fff" />
      <text x="60" y="76" textAnchor="middle" fontFamily="Space Grotesk" fontWeight="700" fontSize="16" fill="#fff">ABC KIOSK</text>
      <text x="60" y="86" textAnchor="middle" fontFamily="Space Grotesk" fontSize="4" letterSpacing="0.6" fill="#44D4F7">CAMPUS DINING EXPRESS</text>
    </svg>
  )
}

export function Logo({ className = '' }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <FallbackLogo className={className} />
  return (
    <img src={LOGO_SRC} alt="ABC Kiosk logo" className={`${className} object-cover`} draggable="false" onError={() => setFailed(true)} />
  )
}

function Footer({ terminalId = 'Express-04', online = true }) {
  return (
    <footer className="absolute bottom-6 left-[54px] right-6 flex items-center justify-between text-[17px] font-medium text-muted">
      <div className="flex items-center gap-[14px]">
        <span className="h-[15px] w-[15px] rounded-full bg-brand" />
        Terminal {terminalId} • {online ? 'Online' : 'Offline'}
      </div>
      <div className="flex h-9 items-center gap-[14px] rounded-lg bg-panel px-4 text-soft">
        <NfcIcon />
        NFC / Tap Reader Active
      </div>
    </footer>
  )
}

/* Scaled 1034x1448 stage shared by every screen. Extra props go on the outer <main>. */
export default function Frame({ children, className = '', ...rest }) {
  const scale = useFitScale()
  return (
    <main className="fixed inset-0 overflow-hidden bg-ink text-soft outline-none" {...rest}>
      <div
        className={`absolute left-1/2 top-1/2 ${className}`}
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
        <Footer />
      </div>
    </main>
  )
}