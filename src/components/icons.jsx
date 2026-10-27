const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const HelpIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] text-brand" {...stroke} aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17.5h.01" />
  </svg>
)
export const WarningIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
    <path d="M12 3 2 20h20L12 3Z" fill="#fff" />
    <path d="M12 9.5v5M12 17h.01" stroke="#a30f1c" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)
export const IdIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#7c8494]" {...stroke} aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M9 3h6v4H9zM7 15h4M13 13h4M13 17h4" /><circle cx="8.5" cy="12" r="1.5" />
  </svg>
)
export const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#7c8494]" {...stroke} aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
  </svg>
)
export const LockIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)
export const CheckIcon = ({ className = 'h-4 w-4', fill = '#3fd6b4', tick = '#0e131b' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill={fill} />
    <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke={tick} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke} strokeWidth={2.6} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke} strokeWidth={2.6} aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
)
export const BackspaceIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
    <path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7 6-7Z" /><path d="m13 10 4 4m0-4-4 4" />
  </svg>
)
export const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke} aria-hidden="true">
    <circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s5 1 6 2M19 8v6M16 11h6" />
  </svg>
)

/* ---------- menu screen icons ---------- */
export const GridIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
)
export const RiceIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M3 12h18a9 9 0 0 1-18 0Z" /><path d="M8 12V9m4 3V7m4 5V9M8 21h8" />
  </svg>
)
export const SandwichIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M4 10a8 6 0 0 1 16 0Z" /><path d="M3 13.5c2 1.5 3 1.5 4.5 0s3 1.5 4.5 0 3 1.5 4.5 0 2.500 0 4.500 0" /><path d="M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1Z" />
  </svg>
)
export const CupIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M4 5h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V5Z" /><path d="M17 7h2a2 2 0 0 1 0 5h-2M6 21h9" />
  </svg>
)
export const SlidersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke} aria-hidden="true">
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
  </svg>
)
export const MedalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke} aria-hidden="true">
    <circle cx="12" cy="9" r="6" /><path d="m8.500 14.500-1.500 7 5-3 5 3-1.500-7" /><circle cx="12" cy="9" r="2" />
  </svg>
)
export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#ffb454" />
    <path d="M12 6.500V12l3.500 2" fill="none" stroke="#3a2500" strokeWidth="2.200" strokeLinecap="round" />
  </svg>
)
export const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke} aria-hidden="true">
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
  </svg>
)
export const BagIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 text-brand" aria-hidden="true">
    <path d="M6 8h12l1 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L6 8Z" fill="currentColor" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
export const UserCircleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 text-brand" {...stroke} aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M6.500 18.500c1-2.500 3-3.500 5.500-3.500s4.500 1 5.500 3.500" />
  </svg>
)
export const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke} strokeWidth={2.600} aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
)
export const MinusIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...stroke} strokeWidth={2.600} aria-hidden="true"><path d="M5 12h14" /></svg>
)
/* ---------- cart / payment / confirm icons ---------- */
export const DineInIcon = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.500 1.500-3.500 4.500-3.500 8H17" />
  </svg>
)
export const TakeOutIcon = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M5 8h14l-1.200 12a1 1 0 0 1-1 .9H7.200a1 1 0 0 1-1-.9L5 8Z" /><path d="M9 8V6.500a3 3 0 0 1 6 0V8M9 13h6" />
  </svg>
)
export const CartIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M3 4h2.500l2.200 10.500a1 1 0 0 0 1 .8h8.600a1 1 0 0 0 1-.8L20 8H6.200" /><circle cx="9.500" cy="19.500" r="1.200" /><circle cx="17" cy="19.500" r="1.200" />
  </svg>
)
export const WalletIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={`${className} text-brand`} {...stroke} aria-hidden="true">
    <path d="M4 7.500A2.500 2.500 0 0 1 6.500 5H18v3" /><rect x="3" y="8" width="18" height="12" rx="2.500" /><path d="M16 14h2.500" />
  </svg>
)
export const QrIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={`${className} text-soft`} {...stroke} aria-hidden="true">
    <rect x="3.500" y="3.500" width="6" height="6" rx="1" /><rect x="14.500" y="3.500" width="6" height="6" rx="1" /><rect x="3.500" y="14.500" width="6" height="6" rx="1" />
    <path d="M14.500 14.500h2v2M20.500 14.500v0M14.500 20.500h2M20.500 17.500v3h-2" />
  </svg>
)
export const CashIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={`${className} text-soft`} {...stroke} aria-hidden="true">
    <rect x="3" y="7" width="18" height="11" rx="2" /><circle cx="12" cy="12.500" r="2.500" /><path d="M6 4.500h12" />
  </svg>
)
export const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke} strokeWidth={2.400} aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
)
export const ShieldIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M12 3 4.500 6v5.500c0 4.500 3 8 7.500 9.500 4.500-1.500 7.500-5 7.500-9.500V6L12 3Z" /><path d="m9 12 2.200 2.200L15.500 10" />
  </svg>
)
export const TapIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M9.500 8.500a5 5 0 0 1 0 7M12.500 7a7.500 7.500 0 0 1 0 10M7 10.500a2.500 2.500 0 0 1 0 3" />
  </svg>
)
export const PrinterIcon = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M7 9V3.500h10V9M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><rect x="7" y="14" width="10" height="7" rx="1" />
  </svg>
)
export const RefreshIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={`${className} text-brand`} {...stroke} aria-hidden="true">
    <path d="M20 11a8 8 0 0 0-14.500-3.500L4 9M4 4v5h5M4 13a8 8 0 0 0 14.500 3.500L20 15M20 20v-5h-5" />
  </svg>
)
export const HandIcon = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M8 13V5.500a1.500 1.500 0 0 1 3 0V11M11 10V4a1.500 1.500 0 0 1 3 0v6M14 10V5.500a1.500 1.500 0 0 1 3 0V13M17 10.500a1.500 1.500 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.200a6 6 0 0 1-4.800-2.400L4 15.500a1.600 1.600 0 0 1 2.500-2L8 15" />
  </svg>
)
export const TrashIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden="true">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
)
export const CATEGORY_ICONS = { grid: GridIcon, rice: RiceIcon, sandwich: SandwichIcon, cup: CupIcon }