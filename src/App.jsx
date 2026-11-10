import { useEffect, useState } from 'react'
import WelcomeScreen from './screens/WelcomeScreen.jsx'
import LoginScreen from './screens/LoginScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'
import MenuScreen from './screens/MenuScreen.jsx'
import CartScreen from './screens/CartScreen.jsx'
import PaymentScreen from './screens/PaymentScreen.jsx'
import ConfirmScreen from './screens/ConfirmScreen.jsx'
import WalletScreen from './screens/WalletScreen.jsx'
import TopUpScreen from './screens/TopUpScreen.jsx'
import TransactionsScreen from './screens/TransactionsScreen.jsx'
import { cartSummary } from './lib/cart.js'
import { api, newKey, setToken, setUnauthorizedHandler } from './lib/api.js'
import { clearWallet, refreshWallet, setWallet } from './lib/wallet.js'
import { loadMenu } from './lib/menu.js'
import { preloadMenuImages } from './lib/preload.js'

// Turns a failed API call into the short reason code the payment screen shows a message for.
const reasonFor = (e) => {
  if (e.status === 0) return 'network'
  if (e.status === 402) return 'insufficient'
  if (e.status === 409) return 'conflict'
  if (e.status === 501) return 'not-configured'
  if (e.code === 'ItemUnavailable' || e.code === 'UnknownItem') return 'unavailable'
  return 'failed'
}

export default function App() {
  // welcome -> login <-> register -> menu <-> cart (dine in / take out) -> payment -> confirm
  // menu <-> wallet (balance & rewards) <-> topup | history
  const [screen, setScreen] = useState('welcome')
  const [student, setStudent] = useState(null) // { id, name } once logged in
  const [cart, setCart] = useState({}) // { [itemId]: quantity }
  const [serviceType, setServiceType] = useState(null) // 'dine-in' | 'take-out', chosen on the cart screen
  const [order, setOrder] = useState(null) // last placed order, shown on the confirm screen
  const [checkoutKey, setCheckoutKey] = useState(null) // one per checkout, so a retried payment can never charge twice

  // Load the real menu from the API (falls back to the built-in list if the server is down), then warm the photo cache.
  useEffect(() => { loadMenu().catch(() => {}).finally(preloadMenuImages) }, [])

  const logIn = async ({ balance, points, ...info }) => {
    setWallet({ balance, points })
    await loadMenu().catch(() => {}) // refresh prices / availability for this session
    setStudent(info)
    setScreen('menu')
  }
  const logOut = () => {
    setToken(null)
    clearWallet()
    setStudent(null)
    setCart({})
    setServiceType(null)
    setOrder(null)
    setScreen('welcome')
  }
  // If the login token expires or is rejected while someone is using the kiosk, send them back to the start.
  useEffect(() => { setUnauthorizedHandler(logOut) })

  const startNewOrder = () => {
    setCart({})
    setServiceType(null)
    setOrder(null)
    setScreen('menu')
  }

  // Cart -> Payment: nothing is charged or saved yet, we only remember Dine In / Take Out.
  const goToPayment = (type) => {
    if (!cartSummary(cart).lines.length) return
    setServiceType(type)
    setCheckoutKey(newKey())
    setScreen('payment')
  }

  // Payment -> Confirm: the SERVER prices the order, charges the wallet and saves it.
  // Returns { ok: false, reason } so the payment screen can show an error and stay put.
  const payOrder = async (method, ticket, cash) => {
    const { lines } = cartSummary(cart)
    if (!lines.length) return { ok: false, reason: 'empty-cart' }
    try {
      let placed = await api.placeOrder(lines, serviceType, method, `${checkoutKey}-${method}`)
      // Wallet orders are paid on the spot. GCash / cash orders wait for confirmation:
      // here the QR scan and bill acceptor are simulated, so the app confirms (dev only, the API refuses this in production).
      if (placed.paymentStatus !== 'paid') placed = await api.confirmPayment(placed.number)
      setOrder({ ...placed, ...(method === 'cash' && cash ? { tendered: cash.tendered, change: cash.change } : {}) })
      refreshWallet().catch(() => {}) // new balance + points
      setCart({})
      setScreen('confirm')
      return { ok: true }
    } catch (e) {
      console.error('Order failed:', e.status, e.code, e.body)
      return { ok: false, reason: reasonFor(e), detail: `HTTP ${e.status}${e.code ? ` ${e.code}` : ''}` }
    }
  }

  switch (screen) {
    case 'welcome':
      return <WelcomeScreen onStart={() => setScreen('login')} />
    case 'login':
      return <LoginScreen onSuccess={logIn} onRegister={() => setScreen('register')} onHelp={logOut} />
    case 'register':
      return <RegisterScreen onRegistered={logIn} onBackToLogin={() => setScreen('login')} onHelp={logOut} />
    case 'menu':
      return (
        <MenuScreen
          student={student}
          cart={cart}
          onCartChange={setCart}
          onLogOut={logOut}
          onCheckout={() => setScreen('cart')}
          onOpenWallet={() => setScreen('wallet')}
        />
      )
    case 'cart':
      return (
        <CartScreen
          student={student}
          cart={cart}
          serviceType={serviceType}
          onCartChange={setCart}
          onBack={() => setScreen('menu')}
          onLogOut={logOut}
          onProceed={goToPayment}
        />
      )
    case 'payment':
      return (
        <PaymentScreen
          student={student}
          cart={cart}
          serviceType={serviceType}
          onBackToCart={() => setScreen('cart')}
          onBackToMenu={() => setScreen('menu')}
          onLogOut={logOut}
          onPay={payOrder}
        />
      )
    case 'wallet':
      return (
        <WalletScreen
          student={student}
          cart={cart}
          onLogOut={logOut}
          onBack={() => setScreen('menu')}
          onTopUp={() => setScreen('topup')}
          onHistory={() => setScreen('history')}
        />
      )
    case 'topup':
      return (
        <TopUpScreen
          student={student}
          cart={cart}
          onLogOut={logOut}
          onBackToMenu={() => setScreen('menu')}
          onBackToWallet={() => setScreen('wallet')}
        />
      )
    case 'history':
      return <TransactionsScreen student={student} cart={cart} onLogOut={logOut} onBack={() => setScreen('wallet')} />
    case 'confirm':
      return <ConfirmScreen order={order} student={student} onNewOrder={startNewOrder} onDone={logOut} />
    default:
      return null
  }
}