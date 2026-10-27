# ABC Kiosk (CTU Campus Dining Express)

```bash
npm install
npm run dev
```

Flow: Welcome -> Log In <-> Register -> Menu <-> Cart (Dine In / Take Out) -> Payment -> Confirmation (pickup number + e-receipt)

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
- GCash / QR Ph shows a placeholder QR (`components/QrPlaceholder.jsx`, not scannable). Replace with a real QR Ph payload from your payment provider.
- Pay Cash saves the order as `unpaid` (held `CASH_HOLD_MINUTES` at the Express Counter).
- Order numbers now run ABC-001, ABC-002, ...

## Menu images
- `npm run art` draws illustrated stand-ins (`public/images/menu/*.svg`). Already generated, no key needed.
- `OPENAI_API_KEY=sk-... npm run images` creates real AI photos (`*.jpg`) from `scripts/menu-prompts.json`
  (`-- --force` to redo all, `-- sisig` for one). The app shows the `.jpg` when present, else the `.svg`, else an icon.