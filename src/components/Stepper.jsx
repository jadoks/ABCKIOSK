import { CheckIcon } from './icons.jsx'

export const STEPS = ['Browse', 'Select', 'Cart', 'Pay', 'Confirm']

/*
 * 5-step progress bar shown on the Payment and Confirmation screens.
 * current: 0 = Browse ... 3 = Pay, 4 = Confirm. Earlier steps show a tick.
 */
export default function Stepper({ current = 3 }) {
  return (
    <ol aria-label="Order progress" className="flex h-[92px] items-start justify-between rounded-[16px] bg-[#161c27] px-[22px] pt-[12px]">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="contents">
            <div className="flex w-[84px] flex-none flex-col items-center gap-[6px]" aria-current={active ? 'step' : undefined}>
              <span
                className={`grid h-[40px] w-[40px] place-items-center rounded-full text-[19px] font-semibold ${
                  active ? 'bg-brand text-[#073242]' : done ? 'bg-key text-muted' : 'bg-key text-muted'
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7.500" /></svg>
                ) : (
                  i + 1
                )}
              </span>
              <span className={`text-[20px] font-medium leading-6 ${active ? 'text-brand' : 'text-muted'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className={`mt-[19px] h-[3px] flex-1 rounded-full ${i === current - 1 ? 'bg-brand' : 'bg-[#2b3342]'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}