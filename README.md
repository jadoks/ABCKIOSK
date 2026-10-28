# ABC Kiosk (CTU Campus Dining Express)

```bash
npm install
npm run dev
```

Flow: Welcome -> Log In <-> Register -> Menu <-> Cart (Dine In / Take Out) -> Payment -> Confirmation (pickup number + e-receipt)

Wallet: Menu -> Loyalty card -> Student ID Wallet & Rewards -> Top Up (GCash QR Ph or Insert Cash) / Transaction History

- `src/lib/db.js`     local "database" (localStorage). Replace with real API calls later.
- `src/lib/config.js` ID length, PIN length, max attempts.
- `src/lib/students.js` hardcoded registrar: 20 students (IDs 7230494 to 7230513), each with their own name and course.
- Clear saved accounts: DevTools > Application > Local Storage > delete `abc-kiosk-db`.
- `src/data/menu.js` hardcoded menu (11 items). Photos go in `public/images/menu/` (see `IMAGES.md`).
- `src/lib/config.js` also sets `AUTO_LOCK_SECONDS` (60s without touch) and `IDLE_WARNING_SECONDS` (15s). After the idle time, the "Are You Still Ordering?" modal (`components/IdleWarningModal.jsx`, logic in `hooks/useIdleWarning.js`) appears on the Menu, Cart and Payment screens. "I'm Still Here" restarts the timer; doing nothing for the 15s logs out and clears the cart.
- `src/lib/db.js` also saves placed orders (`abc-kiosk-orders` in localStorage), numbered A-101, A-102, ...
- Screens: `CartScreen.jsx` (review / change quantities / choose Dine In or Take Out), `PaymentScreen.jsx` (Campus ID Wallet, GCash / QR Ph, Pay Cash), `ConfirmScreen.jsx` (pickup number, e-receipt, print claim slip).
- Nothing is charged or saved until the student pays: the order is created in `App.jsx > payOrder()`.
- Campus ID Wallet: every student starts at `DEFAULT_WALLET_BALANCE` (config.js, P850). Balances are saved in localStorage key `abc-kiosk-wallet`; delete it to reset. `db.topUpWallet(id, amount)` adds funds.
- Pay Cash is now a hardware payment (bill acceptor + coin hopper), not "pay at the counter". Change is shown on the receipt.
- GCash / QR Ph shows a placeholder QR (`components/QrPlaceholder.jsx`, not scannable). Replace with a real QR Ph payload from your payment provider.
- Pay Cash saves the order as `unpaid` (held `CASH_HOLD_MINUTES` at the Express Counter).
- Order numbers now run ABC-001, ABC-002, ...

## Menu images
- `npm run art` draws illustrated stand-ins (`public/images/menu/*.svg`). Already generated, no key needed.
- `OPENAI_API_KEY=sk-... npm run images` creates real AI photos (`*.jpg`) from `scripts/menu-prompts.json`
  (`-- --force` to redo all, `-- sisig` for one). The app shows the `.jpg` when present, else the `.svg`, else an icon.

## Wallet, rewards & top-up (new designs)
- `screens/WalletScreen.jsx`: balance, Meal Points, tier progress, redeem perks (`lib/rewards.js` lists the 4 perks, tiers live in `config.js > TIERS`).
- `screens/TopUpScreen.jsx`: amount (100 / 200 / 500 / 1,000 or custom keypad) -> GCash QR Ph screen or Insert Cash screen -> success.
- `screens/TransactionsScreen.jsx`: wallet statement, 5 rows at a time ("Load Older Transactions").
- `screens/PaymentScreen.jsx`: GCash now has "Generate QR Code" -> full QR scan screen; Pay Cash shows the live hardware panel.
- `lib/db.js` new: `creditWallet`, `getPoints`, `redeemReward`, `transactions` (ledger key `abc-kiosk-ledger`, points key `abc-kiosk-points`). Wallet-paid orders, top-ups and redemptions are logged automatically. Paid orders earn `POINTS_PER_PESO` points.
- Cash inserted and then abandoned (Cancel, Back, auto-logout) is credited to the student's wallet (`hooks/useCashSession.js`).
- The idle auto-lock pauses while a QR / cash payment is waiting (`SessionBar idlePaused`).

### Hooking up real hardware / payments
`config.js` has two demo switches, set both to `false` on the real kiosk:
- `SIMULATE_PAYMENTS`: a QR payment is auto-confirmed after `SIMULATED_QR_SECONDS`. Replace with a server confirmation (webhook / polling) in `TopUpScreen.jsx > QrStage` and `PaymentScreen.jsx > QrScanStage`.
- `SIMULATE_HARDWARE`: shows on-screen bill / coin buttons. Replace with your validator driver calling `cashAcceptor.emit(amountInPesos)` from `lib/cashAcceptor.js`.
QR codes are still placeholders (`QrPlaceholder.jsx`), swap for a real QR Ph payload.
