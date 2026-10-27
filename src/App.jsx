import { useEffect, useState } from 'react'
import WelcomeScreen from './screens/WelcomeScreen.jsx'
import LoginScreen from './screens/LoginScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'
import MenuScreen from './screens/MenuScreen.jsx'
import CartScreen from './screens/CartScreen.jsx'
import PaymentScreen from './screens/PaymentScreen.jsx'
import ConfirmScreen from './screens/ConfirmScreen.jsx'
import { cartSummary, orderTotals, readyMinutes } from './lib/cart.js'
import { db } from './lib/db.js'
import { preloadMenuImages } from './lib/preload.js'

export default function App() {
  // welcome -> login <-> register -> menu <-> cart (dine in / take out) -> payment -> confirm
  const [screen, setScreen] = useState('welcome')
  const [student, setStudent] = useState(null) // { id, name } once logged in
  const [cart, setCart] = useState({}) // { [itemId]: quantity }
  const [serviceType, setServiceType] = useState(null) // 'dine-in' | 'take-out', chosen on the cart screen
  const [order, setOrder] = useState(null) // last placed order, shown on the confirm screen

  useEffect(() => { preloadMenuImages() }, []) // warm the photo cache before the menu opens

  const logIn = (s) => {
    setStudent(s)
    setScreen('menu')
  }
  const logOut = () => {
    setStudent(null)
    setCart({})
    setServiceType(null)
    setOrder(null)
    setScreen('welcome')
  }
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
    setScreen('payment')
  }

  // Payment -> Confirm: charge (wallet only), save the order, show the receipt.
  // Returns { ok: false, reason } so the payment screen can show an error and stay put.
  const payOrder = (method, ticket) => {
    const { lines } = cartSummary(cart)
    if (!lines.length) return { ok: false, reason: 'empty-cart' }
    const { subtotal, ecoFee, serviceFee, total } = orderTotals(lines)

    let balanceAfter = null
    if (method === 'wallet') {
      const charge = db.chargeWallet(student.id, total)
      if (!charge.ok) return charge
      balanceAfter = charge.balance
    }

    setOrder(db.placeOrder(student.id, lines, total, readyMinutes(lines), {
      subtotal, ecoFee, serviceFee, serviceType,
      paymentMethod: method, // 'wallet' | 'gcash' | 'cash'
      paymentStatus: method === 'cash' ? 'unpaid' : 'paid',
      authCode: `${ticket?.slice(2) ?? String(Math.floor(1000 + Math.random() * 9000))}-TX`,
      balanceAfter,
    }))
    setCart({})
    setScreen('confirm')
    return { ok: true }
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
    case 'confirm':
      return <ConfirmScreen order={order} student={student} onNewOrder={startNewOrder} onDone={logOut} />
    default:
      return null
  }
}