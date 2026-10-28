import Frame from '../components/Frame.jsx'
import AppHeader from '../components/Header.jsx'
import SessionBar from '../components/SessionBar.jsx'
import Stepper from '../components/Stepper.jsx'
import { CheckIcon, PrinterIcon, RefreshIcon } from '../components/icons.jsx'
import { CASH_HOLD_MINUTES, SERVICE_TYPES } from '../lib/config.js'
import { clock, orderSummary, peso, titleName } from '../lib/format.js'

const METHOD_LABEL = { wallet: 'Campus ID Wallet', gcash: 'GCash / QR Ph', cash: 'Pay Cash' }

/* Where the student goes next, by order type / payment */
function nextStep(order) {
  if (order.paymentStatus === 'unpaid') return { text: `Please pay at the Express Counter within ${CASH_HOLD_MINUTES} minutes`, tone: 'amber' }
  if (order.serviceType === 'dine-in') return { text: 'Please find a table — we will call your number', tone: 'mint' }
  return { text: 'Please proceed to Express Prep Lane 2', tone: 'mint' }
}

function Row({ label, children, tone = '' }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-6">
      <span className="whitespace-nowrap font-body text-[22px] text-muted">{label}</span>
      <span className={`text-right text-[23px] font-semibold ${tone}`}>{children}</span>
    </div>
  )
}

/* Small printable claim slip. Hidden on screen, the only thing visible when printing (see index.css). */
function ClaimSlip({ order, student }) {
  return (
    <div className="claim-slip">
      <h1>ABC KIOSK</h1>
      <p className="c">Campus Dining Express</p>
      <hr />
      <p className="c">PICKUP NUMBER</p>
      <p className="big">#{order.number}</p>
      <p className="c">{SERVICE_TYPES[order.serviceType]} • {order.paymentStatus === 'unpaid' ? 'UNPAID — pay at counter' : 'PAID'}</p>
      <hr />
      <p>{student?.id} {titleName(student?.name)}</p>
      {order.lines.map((l) => (
        <p key={l.id} className="row"><span>{l.qty} x {l.name}</span><span>{peso(l.price * l.qty)}</span></p>
      ))}
      <p className="row"><span>Eco-packaging</span><span>{peso(order.ecoFee)}</span></p>
      <p className="row b"><span>TOTAL</span><span>{peso(order.total)}</span></p>
      <hr />
      <p className="row"><span>Method</span><span>{METHOD_LABEL[order.paymentMethod]}</span></p>
      <p className="row"><span>Auth</span><span>{order.authCode}</span></p>
      <p className="row"><span>Ready by</span><span>{order.readyBy}</span></p>
      <p className="row"><span>Placed</span><span>{order.placedTime}</span></p>
    </div>
  )
}

export default function ConfirmScreen({ order, student, onNewOrder, onDone }) {
  const paid = order.paymentStatus === 'paid'
  const next = nextStep(order)
  const placed = new Date(order.placedAt)
  const readyBy = clock(new Date(placed.getTime() + order.readyMinutes * 60000))
  const slipOrder = { ...order, readyBy, placedTime: `Today, ${clock(placed)}` }

  // Both buttons print the claim slip first (window.print() waits for the print dialog to close).
  // Kiosk: wire this to the receipt printer.
  const printSlip = () => window.print()
  const printAndFinish = () => {
    printSlip()
    onDone() // log out
  }
  const printAndReorder = () => {
    printSlip()
    onNewOrder() // keep the session, empty cart, back to the Menu
  }

  return (
    <>
      <Frame>
        <AppHeader onHelp={onDone} />
        <SessionBar student={student} onLogOut={onDone} />

        <div className="absolute left-[45px] right-[29px] top-[262px] flex flex-col">
          <Stepper current={4} />

          <section className="mt-6 overflow-hidden rounded-[28px] border border-[#1f2b3d] bg-[#0f1726]" aria-label="Order confirmation">
            <div className={`flex h-[72px] items-center justify-center gap-4 whitespace-nowrap text-[22px] font-bold tracking-[0.01em] text-[#052e22] ${paid ? 'bg-[#10b981]' : 'bg-amber'}`}>
              <span className="grid h-[38px] w-[38px] place-items-center rounded-full bg-white"><CheckIcon className="h-[34px] w-[34px]" fill="#fff" tick={paid ? '#10b981' : '#b87400'} /></span>
              {paid ? 'TRANSACTION SUCCESSFUL — PRE-ORDER CONFIRMED & PAID!' : 'PRE-ORDER CONFIRMED — PAY AT COUNTER'}
            </div>

            <div className="flex flex-col items-center px-6 pb-6 pt-6 text-center">
              <p className="text-[22px] font-semibold tracking-[0.14em] text-muted">YOUR PICKUP NUMBER</p>
              <p className="mt-1 text-[100px] font-bold leading-[104px] text-brand [text-shadow:0_0_30px_rgba(68,212,247,0.45)]">#{order.number}</p>
              <p className={`mt-3 flex items-center gap-3 rounded-full border px-6 py-2 text-[24px] font-medium ${
                next.tone === 'amber' ? 'border-amber/50 bg-amber/10 text-amber' : 'border-mint/50 bg-mint/10 text-mint'
              }`}>
                <span className={`h-3 w-3 rounded-full ${next.tone === 'amber' ? 'bg-amber' : 'bg-mint'}`} /> {next.text}
              </p>
            </div>

            <div className="relative border-t-2 border-[#26324a]">
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-md border border-[#26324a] bg-[#0f1726] px-5 py-[6px] font-mono text-[16px] tracking-[0.2em] text-muted">OFFICIAL E-RECEIPT</span>
              <div className="px-9 pb-4 pt-9">
                <Row label="Student Details:">{student?.id} ({titleName(student?.name)})</Row>
                <Row label="Order Summary:">{orderSummary(order.lines)}</Row>
                <Row label="Order Type:" tone="text-amber">{SERVICE_TYPES[order.serviceType]}</Row>
                <Row label="Ready By:" tone="text-amber">≈ {readyBy} (about {order.readyMinutes} min)</Row>

                <div className="mt-3 border-t border-[#26324a] pt-3">
                  <Row label={paid ? 'Amount Paid:' : 'Amount Due:'}>
                    {peso(order.total)} <span className="text-[19px] font-medium text-muted">({METHOD_LABEL[order.paymentMethod]})</span>
                  </Row>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-[16px] border border-[#1d3a56] bg-[#14203a] px-6 py-4">
                  {order.paymentMethod === 'wallet' && (
                    <>
                      <div><p className="text-[24px] font-semibold">Remaining Balance:</p><p className="font-body text-[18px] text-muted">Instantly updated &amp; secured</p></div>
                      <p className="text-[52px] font-bold leading-none text-brand">{peso(order.balanceAfter)}</p>
                    </>
                  )}
                  {order.paymentMethod === 'gcash' && (
                    <>
                      <div><p className="text-[24px] font-semibold">Payment Status:</p><p className="font-body text-[18px] text-muted">Received via QR Ph</p></div>
                      <p className="text-[52px] font-bold leading-none text-mint">PAID</p>
                    </>
                  )}
                  {order.paymentMethod === 'cash' && order.paymentStatus === 'paid' && (
                    <>
                      <div>
                        <p className="text-[24px] font-semibold">Payment Status:</p>
                        <p className="font-body text-[18px] text-muted">Cash received {peso(order.tendered ?? order.total)}{order.change > 0 ? ` • Change ${peso(order.change)}` : ''}</p>
                      </div>
                      <p className="text-[52px] font-bold leading-none text-mint">PAID</p>
                    </>
                  )}
                  {order.paymentMethod === 'cash' && order.paymentStatus !== 'paid' && (
                    <>
                      <div><p className="text-[24px] font-semibold">Payment Status:</p><p className="font-body text-[18px] text-muted">Pay at the Express Counter before the hold ends</p></div>
                      <p className="text-[52px] font-bold leading-none text-amber">UNPAID</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex h-[62px] items-center justify-between bg-[#0a101c] px-9 font-mono text-[18px] text-muted">
                <span>Auth Code: {order.authCode}</span>
                <span>Date/Time: Today, {clock(placed)}</span>
              </div>
            </div>
          </section>

          <button type="button" onClick={printAndFinish}
            className="mt-5 flex h-[72px] items-center justify-center gap-4 rounded-[16px] bg-brand text-[27px] font-semibold text-[#073242] shadow-[0_0_30px_rgba(68,212,247,0.25)] transition active:scale-[0.98]">
            <PrinterIcon /> Print Claim Slip &amp; Finish Session →
          </button>
          <button type="button" onClick={printAndReorder}
            className="mt-3 flex h-[64px] items-center justify-center gap-3 rounded-[16px] border border-[#2b3342] bg-[#121824] text-[24px] font-semibold transition active:scale-[0.98]">
            <RefreshIcon /> Print Slip &amp; Start Another Pre-Order
          </button>
        </div>
      </Frame>
      <ClaimSlip order={slipOrder} student={student} />
    </>
  )
}