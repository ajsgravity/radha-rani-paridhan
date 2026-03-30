import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/CartDrawer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata = {
  title: 'Radha Rani Paridhan Ajmer — Premium Indian Ethnic Wear',
  description: 'Discover timeless elegance with handcrafted sarees, lehengas, anarkali suits and ethnic wear from Radha Rani Paridhan Ajmer. Premium quality, authentic craftsmanship.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
