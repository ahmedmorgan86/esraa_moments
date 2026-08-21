import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

import { translations, setUiLang } from './i18n';
import type { Product, CartItem } from './data';
import { useProducts, useLocalStorage } from './hooks';
import { pageVariants } from './components/motion';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ShopPage } from './pages/Shop';
import { ProductPage } from './pages/Product';
import { Customizer } from './pages/Customizer';
import { CheckoutPage } from './pages/Checkout';
import { TrackingPage } from './pages/Tracking';
import { LoginPage } from './pages/Login';
import { AdminPage } from './pages/Admin';

function App() {
  const products = useProducts();
  const [cart, setCart] = useLocalStorage<CartItem[]>('em-cart', []);
  const [wish, setWish] = useLocalStorage<string[]>('em-wish', []);
  const [dark, setDark] = useState(() => localStorage.getItem('em-dark') === '1');
  const [lang, setLang] = useLocalStorage<'ar' | 'en'>('em-lang', 'ar');
  const [menu, setMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('em-dark', dark ? '1' : '0');
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    setUiLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = translations[lang].pageTitle;
  }, [lang]);

  useEffect(() => {
    if (!localStorage.getItem('em-settings')) {
      localStorage.setItem('em-settings', JSON.stringify({
        shippingFee: '25', freeShippingThreshold: '500',
        phone: '01097905455', whatsapp: '201097905455',
        instagram: 'https://www.instagram.com/esraamomentsstore',
        tiktok: 'https://www.tiktok.com/@esraamomentsstore'
      }));
    }
  }, []);

  useEffect(() => { if (!location.hash) window.scrollTo(0, 0); setMenu(false); }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) return;
    const timer = setTimeout(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(timer);
  }, [location]);

  const addToCart = useCallback((p: Product) => {
    setCart(c => {
      const existing = c.find(i => i.id === p.id);
      if (existing) return c.map(i => i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...c, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  }, [setCart]);

  const removeFromCart = useCallback((id: string) => setCart(c => c.filter(x => x.id !== id)), [setCart]);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(1, Math.min(x.qty + delta, x.stock)) } : x));
  }, [setCart]);

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const t = translations[lang];

  return (
    <div className={`app ${lang === 'en' ? 'lang-en' : 'lang-ar'}`}>
      <Header
        cartCount={cartCount}
        menu={menu}
        setMenu={setMenu}
        dark={dark}
        setDark={setDark}
        lang={lang}
        setLang={setLang}
        t={t}
        onCartClick={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        changeQty={changeQty}
        remove={removeFromCart}
        total={cartTotal}
        t={t}
      />

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname + lang} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/" element={<Home products={products} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />} />
            <Route path="/shop" element={<ShopPage products={products} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />} />
            <Route path="/product/:id" element={<ProductPage products={products} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />} />
            <Route path="/custom" element={<Customizer t={t} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} cartTotal={cartTotal} t={t} />} />
            <Route path="/track" element={<TrackingPage t={t} />} />
            <Route path="/login" element={<LoginPage t={t} />} />
            <Route path="/admin/*" element={<AdminPage t={t} />} />
            <Route path="*" element={
              <motion.section className="section page" {...pageVariants}>
                <div className="emptyState">
                  <Search size={48} strokeWidth={1} />
                  <h3>{t.nfTitle}</h3>
                  <p>{t.nfSub}</p>
                  <Link className="btn primary" to="/">{t.nfBtn}</Link>
                </div>
              </motion.section>
            } />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <FloatingWhatsApp />
      <Footer t={t} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
