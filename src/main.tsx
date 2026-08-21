import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ShoppingBag, Search, Menu, X, ArrowLeft, ArrowRight, Plus, Minus,
  Package, LayoutDashboard, Box, Users, Tag, Settings, Sparkles, Instagram,
  MessageCircle, ChevronDown, LogIn, LogOut, Check, Trash2, ShieldCheck,
  Heart, Sun, Moon, MapPin, CreditCard, Send, Store, Music, Edit3, Eye,
  BarChart3, TrendingUp, Clock, Truck, Star, Filter, Download, Globe,
  Lock, Palette, Gift, Calendar, Phone, Mail, Hash, DollarSign,
  AlertTriangle, ChevronRight, ChevronLeft, Image as ImageIcon, RotateCw, Upload, FileText
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { supabase } from './lib/supabase';
import './styles.css';

import { translations, uiLang, setUiLang, orderStatusLabels, paymentStatusLabels, orderStatusLabel, paymentStatusLabel, occLabel, pickLabel, prodName, prodDesc, favorTypeEn, colorEn, cityEn } from './i18n';
import type { Lang } from './i18n';
import { occasions, seed, PALETTES } from './data';
import type { Product, CartItem, Order, Customer, Coupon, Design } from './data';
import { money, getLocal, ease } from './lib';
import { AnimateScroll, AnimateScale, StaggerContainer, StaggerItem, pageVariants } from './components/motion';
import { useProducts, useLocalStorage, useScrollShadow } from './hooks';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ShopPage } from './pages/Shop';
import { ProductPage } from './pages/Product';

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







const TYPE_ICONS: Record<string, any> = { 'علبة': Box, 'برطمان': Package, 'كيس فاخر': ShoppingBag, 'بوكس هدية': Gift };

function Customizer({ t }: { t: typeof translations.ar }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Design>({ occasion: 'زفاف', type: 'علبة', qty: 30, color: 'آيفوري وذهبي', name: '', date: '', extras: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const steps = ['المناسبة', 'التوزيعة', 'التفاصيل', 'المراجعة'];
  const pal = PALETTES[form.color] || PALETTES['آيفوري وذهبي'];
  const TypeIcon = TYPE_ICONS[form.type] || Gift;
  const monogram = (form.name.trim()[0] || 'E').toUpperCase();

  const submit = async () => {
    if (sending) return;
    setSending(true);
    if (supabase) {
      const { error } = await supabase.from('custom_designs').insert({
        reference: `CD-${Date.now().toString().slice(-7)}`,
        occasion: form.occasion, favor_type: form.type, quantity: form.qty,
        palette: form.color, inscription: form.name, event_date: form.date || null, extras: form.extras
      });
      if (error) { alert(error.message); setSending(false); return; }
    } else {
      localStorage.setItem('em-design', JSON.stringify(form));
      const list = getLocal<any[]>('em-designs', []);
      localStorage.setItem('em-designs', JSON.stringify([...list, { ...form, reference: `CD-${Date.now().toString().slice(-7)}`, created_at: new Date().toISOString() }]));
    }
    setSending(false);
    setSent(true);
  };

  return (
    <motion.section className="section page customPage" {...pageVariants}>
      <div className="studioHero">
        <span className="studioGlow g1" /><span className="studioGlow g2" /><span className="studioGlow g3" />
        <AnimateScroll className="studioHeroInner">
          <span className="eyebrow">BESPOKE STUDIO</span>
          <h1>{t.custTitle} <em>{t.custTitleAccent}</em></h1>
          <p>{t.custSub}</p>
        </AnimateScroll>
      </div>

      <div className="studioBody">
        <div className="studioPreviewCol">
          <motion.div
            className="favorBox"
            style={{ '--pvBg': pal.bg, '--pvDeep': pal.deep, '--pvSoft': pal.soft } as React.CSSProperties}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
          >
            <span className="ribbonV" /><span className="ribbonH" />
            <motion.span key={monogram + form.name} className="monogram" initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>{monogram}</motion.span>
            <div className="favorText">
              <motion.b key={form.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>{form.name || t.previewNamePh}</motion.b>
              <small>{form.date || t.previewDatePh}</small>
            </div>
            <div className="favorMeta"><TypeIcon size={13} /> {pickLabel(form.type, favorTypeEn)}<i>•</i>{pickLabel(form.color, colorEn)}</div>
            <div className="swatchRow">
              {Object.keys(PALETTES).map(c => (
                <button key={c} type="button" title={pickLabel(c, colorEn)} className={c === form.color ? 'swatch on' : 'swatch'} style={{ background: PALETTES[c].deep }} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </div>
          </motion.div>
          <p className="previewHint"><Sparkles size={14} /> {t.previewHint}</p>
        </div>

        <div className="studioFormCol">
          <div className="stepPills">
            {t.custSteps.map((s, i) => (
              <button key={s} type="button" className={i === step ? 'on' : i < step ? 'done' : ''} disabled={i > step} onClick={() => setStep(i)}>
                <i>{i < step ? <Check size={11} /> : i + 1}</i>
                <span>{s}</span>
              </button>
            ))}
          </div>

          <div className="studioCard">
            {sent ? (
              <motion.div className="successBlock" initial={{ opacity: 0, scale: .85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: .1 }}>
                  <Check size={44} />
                </motion.div>
                <h3>{t.designReceivedT}</h3>
                <p>{t.designReceivedP}</p>
                <Link className="btn primary" to="/shop">{t.exploreProducts}</Link>
              </motion.div>
            ) : (
              <>
                <span className="stepTitle">{t.stepWord} {step + 1} {t.ofWord} 4 — {t.custSteps[step]}</span>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: .28, ease }}
                    className="stepContent"
                  >
                    {step === 0 && (
                      <div className="occGrid">
                        {occasions.map((o, i) => (
                          <button key={o} type="button" className={form.occasion === o ? 'occCard on' : 'occCard'} onClick={() => setForm({ ...form, occasion: o })}>
                            <span className="occIdx">{String(i + 1).padStart(2, '0')}</span>
                            <b>{occLabel(o)}</b>
                            <ArrowLeft size={15} className="flip-x occArrow" />
                          </button>
                        ))}
                      </div>
                    )}
                    {step === 1 && (
                      <div className="typeGrid">
                        {['علبة', 'برطمان', 'كيس فاخر', 'بوكس هدية'].map(ty => {
                          const I = TYPE_ICONS[ty] || Gift;
                          return (
                            <button key={ty} type="button" className={form.type === ty ? 'typeCard on' : 'typeCard'} onClick={() => setForm({ ...form, type: ty })}>
                              <I size={24} strokeWidth={1.6} />
                              <b>{pickLabel(ty, favorTypeEn)}</b>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {step === 2 && (
                      <div className="formGrid">
                        <label>{t.qty}<input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: Math.max(1, +e.target.value || 1) })} /></label>
                        <label>{t.sColor}<select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>{Object.keys(PALETTES).map(c => <option key={c} value={c}>{pickLabel(c, colorEn)}</option>)}</select></label>
                        <label className="wide">{t.printedName}<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t.namePlaceholder} /></label>
                        <label className="wide">{t.dateLabel}<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
                        <label className="wide">{t.extraNotes}<textarea value={form.extras} onChange={e => setForm({ ...form, extras: e.target.value })} placeholder={t.extrasPlaceholder} /></label>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="summaryReview">
                        <div className="summaryRow link" onClick={() => setStep(0)}><span>{t.sOccasion}</span><b>{occLabel(form.occasion)}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(1)}><span>{t.sType}</span><b>{pickLabel(form.type, favorTypeEn)}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sQty}</span><b>{form.qty} {t.piecesWord}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sColor}</span><b>{pickLabel(form.color, colorEn)}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sName}</span><b>{form.name || '---'}</b><Edit3 size={13} /></div>
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sDate}</span><b>{form.date || '---'}</b><Edit3 size={13} /></div>
                        {form.extras && <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sNotes}</span><b>{form.extras}</b><Edit3 size={13} /></div>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="stepNav">
                  {step > 0 ? (
                    <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setStep(step - 1)}>
                      <ArrowRight size={16} className="flip-x" /> {t.prevBtn}
                    </motion.button>
                  ) : <span />}
                  {step < steps.length - 1 ? (
                    <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={() => setStep(step + 1)}>
                      {t.nextBtn} <ArrowLeft size={16} className="flip-x" />
                    </motion.button>
                  ) : (
                    <motion.button className="btn primary btnLg" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={submit} disabled={sending}>
                      {t.sendDesign} <Sparkles size={16} />
                    </motion.button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

type SetCart = React.Dispatch<React.SetStateAction<CartItem[]>>;
function CheckoutPage({ cart, setCart, cartTotal, t }: { cart: CartItem[]; setCart: SetCart; cartTotal: number; t: typeof translations.ar }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: 'القاهرة', address: '', occasion: 'سبوع', notes: '', payment: 'instapay' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Per business specs, shipping & final price are confirmed after admin review, but we show estimated starting subtotal & request submission
  const storeCfg = getLocal<any | null>('em-settings', null);
  const SHIP_FEE = Number(storeCfg?.shippingFee) > 0 ? Number(storeCfg.shippingFee) : 25;
  const FREE_OVER = Number(storeCfg?.freeShippingThreshold) || 500;
  const estimatedShipping = cartTotal >= FREE_OVER ? 0 : SHIP_FEE;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent' ? Math.round(cartTotal * appliedCoupon.discount / 100) : appliedCoupon.discount
    : 0;
  const estimatedTotal = cartTotal - discount + estimatedShipping;

  const defaultCoupons: Coupon[] = [
    { id: 'c1', code: 'MOMENTS10', discount: 10, type: 'percent', maxUsage: 100, usageCount: 12, minOrder: 200, expiry: '2026-12-31', active: true },
    { id: 'c2', code: 'ESRAA2026', discount: 15, type: 'percent', maxUsage: 50, usageCount: 5, minOrder: 300, expiry: '2026-12-31', active: true },
  ];

  const applyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    let c: Coupon | null = null;
    if (supabase) {
      const { data } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).maybeSingle();
      if (data) c = {
        id: data.id, code: data.code, discount: Number(data.amount), type: data.discount_type === 'fixed' ? 'fixed' : 'percent',
        maxUsage: data.usage_limit ?? Infinity, usageCount: data.used_count ?? 0, minOrder: 0,
        expiry: data.expires_at || '', active: !!data.is_active
      };
    } else {
      c = defaultCoupons.find(x => x.code.toUpperCase() === code && x.active) || null;
    }
    if (!c) { setCouponError(t.errInvalidCoupon); return; }
    if (c.expiry && new Date(c.expiry).getTime() < Date.now()) { setCouponError(t.errExpiredCoupon); return; }
    if (c.maxUsage !== Infinity && c.usageCount >= c.maxUsage) { setCouponError(t.errUsedUpCoupon); return; }
    if (c.minOrder > cartTotal) { setCouponError(`${t.errMinOrderPrefix} ${money(c.minOrder)}`); return; }
    setAppliedCoupon(c);
    setCouponError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length || submitting) return;
    setSubmitting(true);
    const orderNo = `EM-${Date.now().toString().slice(-8)}`;
    const orderData = {
      order_number: orderNo,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      city: form.city,
      address: form.address,
      occasion: form.occasion,
      notes: form.notes,
      payment_method: form.payment,
      subtotal: cartTotal,
      shipping_fee: estimatedShipping,
      total: estimatedTotal,
      status: 'قيد المراجعة',
      payment_status: 'بانتظار تأكيد السعر والشحن',
      items: cart,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('orders').insert({
        order_number: orderNo, customer_name: form.name, customer_phone: form.phone,
        customer_email: form.email, city: form.city, address: form.address,
        occasion: form.occasion, notes: form.notes, payment_method: form.payment,
        subtotal: cartTotal, shipping_fee: estimatedShipping, discount, total: estimatedTotal,
        status: 'pending', payment_status: 'unpaid'
      }).select().single();
      if (error) { alert(error.message); setSubmitting(false); return; }
      await supabase.from('order_items').insert(cart.map(i => ({
        order_id: data.id, product_id: i.id, name: i.name,
        unit_price: i.price, quantity: i.qty, total: i.price * i.qty
      })));
      if (appliedCoupon) {
        await supabase.from('coupons').update({ used_count: appliedCoupon.usageCount + 1 }).eq('id', appliedCoupon.id);
      }
    } else {
      localStorage.setItem('em-last-order', JSON.stringify(orderData));
      const existingOrders = getLocal<any[]>('em-all-orders', []);
      localStorage.setItem('em-all-orders', JSON.stringify([orderData, ...existingOrders]));
    }
    setCart([]);
    setDone(orderNo);
  };

  if (done) return (
    <motion.section className="section page successPage" {...pageVariants}>
      <motion.div className="successIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <Check size={48} />
      </motion.div>
      <h1>{t.successTitle}</h1>
      <p className="orderNumber">{t.orderNoWord} <b>{done}</b></p>
      <p>{t.successDesc}</p>
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }}>
        <Link className="btn primary" to={`/track?order=${done}`}><MapPin size={18} /> {t.trackAndPay}</Link>
      </motion.div>
    </motion.section>
  );

  if (!cart.length) return (
    <motion.section className="section page" {...pageVariants}>
      <div className="emptyState">
        <ShoppingBag size={48} strokeWidth={1} />
        <h3>{t.cartEmptyTitle}</h3>
        <p>{t.cartEmptySub}</p>
        <Link className="btn primary" to="/shop">{t.browseShop}</Link>
      </div>
    </motion.section>
  );

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER REQUEST</span><h2>{t.checkoutTitle}</h2></div></AnimateScroll>
      </div>
      <form className="checkoutGrid" onSubmit={submit}>
        <div className="checkoutFields">
          <AnimateScroll><label><span className="labelIcon"><Phone size={14} /></span> {t.fullName}<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.05}><label><span className="labelIcon"><Phone size={14} /></span> {t.phoneNum}<input type="tel" required pattern="01[0-9]{9}" title={uiLang === 'en' ? 'Egyptian mobile, e.g. 01012345678' : 'رقم موبايل مصري مثل 01012345678'} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></label></AnimateScroll>
          <AnimateScroll delay={.1}><label><span className="labelIcon"><Mail size={14} /></span> {t.emailLabel}<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.15}><label><span className="labelIcon"><MapPin size={14} /></span> {t.cityLabel}<select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}>{['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'أخرى'].map(c => <option key={c} value={c}>{pickLabel(c, cityEn)}</option>)}</select></label></AnimateScroll>
          <AnimateScroll delay={.2}><label className="wide"><span className="labelIcon"><MapPin size={14} /></span> {t.addressLabel}<textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.25}><label><span className="labelIcon"><Gift size={14} /></span> {t.occasionField}<select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>{occasions.map(o => <option key={o} value={o}>{occLabel(o)}</option>)}</select></label></AnimateScroll>
          <AnimateScroll delay={.3}><label className="wide"><span className="labelIcon"><Edit3 size={14} /></span> {t.notesLabel}<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t.notesPlaceholder} /></label></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="paymentSection">
              <p className="paymentTitle"><CreditCard size={16} /> {t.paymentPreferred}</p>
              {([
                { key: 'instapay', label: t.payInstapay, icon: <DollarSign size={16} /> },
                { key: 'wallet', label: t.payWallet, icon: <CreditCard size={16} /> }
              ] as const).map(opt => (
                <motion.button
                  key={opt.key}
                  type="button"
                  className={form.payment === opt.key ? 'paymentOption active' : 'paymentOption'}
                  whileTap={{ scale: .97 }}
                  onClick={() => setForm({ ...form, payment: opt.key })}
                >
                  {opt.icon} {opt.label}
                </motion.button>
              ))}
            </div>
          </AnimateScroll>
        </div>

        <AnimateScroll>
          <div className="orderSummaryCard">
            <h3>{t.orderSummary}</h3>
            {cart.map(i => (
              <div key={i.id} className="summaryItem">
                <span>{prodName(i)} × {i.qty}</span>
                <b>{money(i.price * i.qty)}</b>
              </div>
            ))}
            <hr />
            <div className="summaryItem"><span>{t.subtotal}</span><b>{money(cartTotal)}</b></div>
            <div className="summaryItem"><span>{t.shipping} {t.estimated}</span><b className={estimatedShipping === 0 ? 'freeShipping' : ''}>{estimatedShipping ? money(estimatedShipping) : t.free}</b></div>

            <div className="couponSection">
              <div className="couponInput">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder={t.couponPlaceholder} />
                <motion.button type="button" className="btn primary" whileTap={{ scale: .95 }} onClick={applyCoupon}>{t.applyBtn}</motion.button>
              </div>
              {couponError && <p className="couponError">{couponError}</p>}
              {appliedCoupon && (
                <p className="couponApplied">
                  <Check size={14} /> {t.couponAppliedPrefix} {appliedCoupon.code} — {t.discountWord} {appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}%` : money(appliedCoupon.discount)}
                </p>
              )}
            </div>

            {discount > 0 && <div className="summaryItem discount"><span>{t.discountLabel}</span><b>-{money(discount)}</b></div>}
            <hr />
            <div className="summaryGrand"><span>{t.grandEst}</span><b>{money(estimatedTotal)}</b></div>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t.finalPriceNote}</p>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }} style={{ marginTop: 16 }}>
              <button className="btn primary full btnLg" type="submit" disabled={!cart.length || submitting}>
                <Send size={18} /> {t.submitOrder}
              </button>
            </motion.div>
          </div>
        </AnimateScroll>
      </form>
    </motion.section>
  );
}

function TrackingPage({ t }: { t: typeof translations.ar }) {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get('order');
  const [order, setOrder] = useState<any>(null);
  const [input, setInput] = useState(q || '');
  const [found, setFound] = useState<boolean | null>(null);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const payPhone = getLocal<any | null>('em-settings', null)?.phone || '01097905455';

  const statusList = t.statusFlow;
  const codeIdx: Record<string, number> = { pending: 0, waiting_price: 0, confirmed: 1, unpaid: 2, proof_submitted: 3, processing: 4, ready: 5, shipped: 5, delivered: 6 };
  const legacyIdx: Record<string, number> = {
    'قيد المراجعة': 0, 'بانتظار تأكيد السعر والشحن': 0, 'Under Review': 0, 'Awaiting Price Confirmation': 0,
    'تم تأكيد السعر': 1, 'Price Confirmed': 1,
    'بانتظار الدفع': 2, 'Awaiting Payment': 2,
    'تم رفع إيصال الدفع': 3, 'تم رفع الإيصال (قيد التحقق)': 3, 'Receipt Submitted': 3, 'Receipt Submitted (Under Review)': 3,
    'تم التحقق والإنتاج': 4, 'Verified & In Production': 4,
    'جاهز للشحن': 5, 'Ready to Ship': 5, 'تم الشحن': 5, 'Shipped': 5,
    'مكتمل': 6, 'Completed': 6
  };
  const idxOf = (v?: string | null) => (v == null ? -1 : codeIdx[v] ?? legacyIdx[v] ?? -1);
  const flowIndex = (o: any): number => Math.max(idxOf(o?.status), idxOf(o?.payment_status), 0);
  const statusIdx = order ? flowIndex(order) : 0;

  const search = async (val?: string) => {
    const v = (typeof val === 'string' ? val : input).trim();
    if (!v) return;
    if (supabase) {
      const { data } = await supabase.from('orders').select('*').eq('order_number', v).maybeSingle();
      setOrder(data); setFound(!!data);
    } else {
      const allOrders = getLocal<any[]>('em-all-orders', []);
      const foundOrd = allOrders.find(o => o.order_number === v);
      const lastOrd = getLocal<any | null>('em-last-order', null);
      const match = foundOrd || (lastOrd?.order_number === v ? lastOrd : null);
      if (match) { setOrder(match); setFound(true); }
      else { setOrder(null); setFound(false); }
    }
  };

  useEffect(() => {
    if (!q) return;
    setInput(q);
    const timer = setTimeout(() => search(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;
    setProofFile(file.name);
    const updated = { ...order, status: 'proof_submitted', payment_status: 'proof_submitted' };
    if (supabase) {
      const proofNote = `[${uiLang === 'en' ? 'Payment receipt uploaded' : 'تم رفع إيصال دفع'}: ${file.name} — ${new Date().toLocaleString(uiLang === 'en' ? 'en-US' : 'ar-EG')}]`;
      const { error } = await supabase.from('orders').update({ payment_status: 'proof_submitted', notes: `${order.notes || ''}\n${proofNote}`.trim() }).eq('id', order.id);
      if (error) { alert((uiLang === 'en' ? 'Could not upload receipt, please try again: ' : 'تعذر رفع الإيصال، حاولي مرة أخرى: ') + error.message); return; }
    } else {
      localStorage.setItem('em-last-order', JSON.stringify(updated));
      const allOrders = getLocal<any[]>('em-all-orders', []).map(o => o.order_number === order.order_number ? updated : o);
      localStorage.setItem('em-all-orders', JSON.stringify(allOrders));
    }
    setOrder(updated);
    setProofSubmitted(true);
  };

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER TRACKING & PAYMENT</span><h2>{t.trackTitle}</h2></div></AnimateScroll>
      </div>
      <div className="trackingPage">
        <AnimateScroll>
          <div className="trackingSearch">
            <Search size={18} />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.orderPlaceholder} onKeyDown={e => e.key === 'Enter' && search()} />
            <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={() => search()}>{t.searchBtn}</motion.button>
          </div>
        </AnimateScroll>

        {order ? (
          <AnimateScroll>
            <div className="trackingCard">
              <div className="trackingCardHead">
                <Package size={24} />
                <div>
                  <h3>{order.order_number}</h3>
                  <p>{t.customerWord} <b>{order.customer_name || '---'}</b></p>
                </div>
              </div>
              <div className="trackingMeta">
                <div><span>{t.orderStatusLabelK}</span><b>{orderStatusLabel(order.status) || t.statusFlow[0]}</b></div>
                <div><span>{t.paymentStatus}</span><b className="priceGrad">{paymentStatusLabel(order.payment_status) || orderStatusLabels.ar.waiting_price}</b></div>
                <div><span>{t.totalFinalLabel}</span><b className="priceGrad">{money(Number(order.total || 0))}</b></div>
                <div><span>{t.shippingConfirmedLabel}</span><b>{money(Number(order.shipping_fee || 25))}</b></div>
                <div><span>{t.addressShort}</span><b>{order.city || '---'} - {order.address || '---'}</b></div>
              </div>

              {/* Payment instructions & proof upload */}
              <div className="paymentWorkflowBox" style={{ marginTop: 24, padding: 20, background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4><CreditCard size={18} /> {t.paymentInstructionsTitle}</h4>
                <p style={{ marginTop: 8, fontSize: 14 }}>{uiLang === 'en'
                  ? <>Please transfer the final total ({money(Number(order.total || 0))}) via InstaPay or Vodafone Cash to: <b>{payPhone}</b>.</>
                  : <>يرجى التحويل عبر InstaPay أو محفظة فودافون كاش إلى الرقم: <b>{payPhone}</b> بالمبلغ الإجمالي النهائي ({money(Number(order.total || 0))}).</>}
                </p>
                <p style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>{t.payInstrNote}</p>

                <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn primary" style={{ cursor: 'pointer' }}>
                    <Upload size={16} /> {t.uploadProof}
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleProofUpload} />
                  </label>
                  {(proofFile || proofSubmitted || order.payment_status === 'proof_submitted' || order.payment_status?.includes('تم رفع')) && (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <Check size={16} /> {t.proofDone} ({proofFile || t.proofFileFallback}) — {t.proofUnderReview}
                    </span>
                  )}
                </div>
              </div>

              <div className="trackingTimeline" style={{ marginTop: 24 }}>
                {statusList.map((s, i) => (
                  <motion.span
                    key={s}
                    className={i <= (statusIdx >= 0 ? statusIdx : 0) ? 'timelineStep active' : 'timelineStep'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * .1 }}
                  >
                    <i>{i <= (statusIdx >= 0 ? statusIdx : 0) ? <Check size={14} /> : i + 1}</i>{s}
                  </motion.span>
                ))}
              </div>
            </div>
          </AnimateScroll>
        ) : found === false ? (
          <AnimateScroll>
            <div className="emptyState">
              <Search size={48} strokeWidth={1} />
              <h3>{t.notFoundTitle}</h3>
              <p>{t.notFoundSub}</p>
            </div>
          </AnimateScroll>
        ) : (
          <AnimateScroll>
            <div className="emptyState">
              <MapPin size={48} strokeWidth={1} />
              <h3>{t.enterNoTitle}</h3>
              <p>{t.enterNoSub}</p>
            </div>
          </AnimateScroll>
        )}
      </div>
    </motion.section>
  );
}

function LoginPage({ t }: { t: typeof translations.ar }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabase) { localStorage.setItem('em-admin-demo', '1'); nav('/admin'); return; }
    const r = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (r.error) { setError(r.error.message); return; }
    if (mode === 'signup') {
      setError(t.signupNotice);
      setMode('login');
      return;
    }
    const userId = r.data.user?.id;
    const { data: roles, error: roleErr } = await supabase.from('user_roles').select('role').eq('user_id', userId).in('role', ['admin', 'staff']);
    if (roleErr || !roles || roles.length === 0) {
      await supabase.auth.signOut();
      setError(t.noRoleError);
      return;
    }
    nav('/admin');
  };

  return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LogIn size={28} />
          </motion.div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>{mode === 'login' ? t.loginTitle : t.signupTitle}</h1>
          <form onSubmit={submit}>
            <label>
              <span className="labelIcon"><Mail size={14} /></span>
              {t.emailLabel}
              <input type="email" required placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
              <span className="labelIcon"><Lock size={14} /></span>
              {t.passwordLabel}
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <motion.button className="btn primary full btnLg" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
              <LogIn size={18} /> {mode === 'login' ? t.loginBtn : t.signupBtn}
            </motion.button>
          </form>
          {error && <p className="authError">{error}</p>}
          <motion.button
            className="textButton"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: .98 }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? t.noAccount : t.haveAccount}
          </motion.button>
        </div>
      </AnimateScale>
    </motion.section>
  );
}

function AdminPage({ t }: { t: typeof translations.ar }) {
  const [tab, setTab] = useState('dashboard');
  const [logged, setLogged] = useState(!supabase && localStorage.getItem('em-admin-demo') === '1');
  const [checkingAuth, setCheckingAuth] = useState(!!supabase);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(seed);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: 'c1', code: 'MOMENTS10', discount: 10, type: 'percent', maxUsage: 100, usageCount: 12, minOrder: 200, expiry: '2026-12-31', active: true },
    { id: 'c2', code: 'ESRAA2026', discount: 15, type: 'percent', maxUsage: 50, usageCount: 5, minOrder: 300, expiry: '2026-12-31', active: true },
  ]);
  const [settings, setSettings] = useState({
    storeName: 'ESRAA Moments', storeDesc: 'تفاصيل صغيرة تصنع لحظات لا تُنسى',
    logoUrl: '/images/logo.jpeg', shippingFee: '25', freeShippingThreshold: '500',
    whatsapp: '201097905455', email: 'info@esraamoments.com', phone: '01097905455',
    instagram: 'https://www.instagram.com/esraamomentsstore', tiktok: 'https://www.tiktok.com/@esraamomentsstore'
  });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) { setLogged(false); setCheckingAuth(false); } return; }
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id).in('role', ['admin', 'staff']);
      if (!active) return;
      setLogged(!!roles && roles.length > 0);
      setCheckingAuth(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setLogged(false);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    (async () => {
      if (supabase) {
        if (!logged) return;
        const a = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
        if (a.data) setOrders(a.data as Order[]);
        const b = await supabase.from('products').select('id,name,price,stock,is_active,image_url,description,is_featured,categories(name)');
        if (b.data) setProducts(b.data.map((x: any) => ({
          id: x.id, name: x.name, category: x.categories?.name || '', price: Number(x.price),
          stock: x.stock, image: x.image_url || seed[0].image, desc: x.description || '', featured: !!x.is_featured
        })));
      } else {
        const localOrders = getLocal<Order[]>('em-all-orders', []);
        const lastOrder = getLocal<Order | null>('em-last-order', null);
        let combined = localOrders;
        if (lastOrder && !combined.some(o => o.order_number === lastOrder.order_number)) {
          combined = [lastOrder, ...combined];
        }
        if (combined.length) setOrders(combined);
      }
    })();
  }, [logged]);

  useEffect(() => {
    (async () => {
      if (!supabase || !logged) return;
      const c = await supabase.from('coupons').select('*');
      if (c.data) setCoupons(c.data.map((row: any) => ({
        id: row.id, code: row.code, discount: Number(row.amount), type: row.discount_type === 'fixed' ? 'fixed' : 'percent',
        maxUsage: row.usage_limit ?? Infinity, usageCount: row.used_count ?? 0, minOrder: 0,
        expiry: row.expires_at || '', active: !!row.is_active
      })));
      const s = await supabase.from('settings').select('value').eq('key', 'store').maybeSingle();
      if (s.data?.value) {
        const v = s.data.value;
        setSettings(prev => ({
          ...prev,
          storeName: v.name ?? prev.storeName,
          shippingFee: String(v.shippingFee ?? prev.shippingFee),
          freeShippingThreshold: String(v.freeShippingOver ?? prev.freeShippingThreshold),
          phone: v.phone ?? prev.phone,
          whatsapp: v.whatsapp ?? prev.whatsapp,
          instagram: v.instagram ?? prev.instagram,
          tiktok: v.tiktok ?? prev.tiktok
        }));
      }
    })();
  }, [logged]);

  useEffect(() => {
    const customerMap = new Map<string, Customer>();
    orders.forEach(o => {
      const name = o.customer_name || 'مجهول';
      const existing = customerMap.get(name);
      if (existing) { existing.ordersCount++; existing.totalSpent += Number(o.total || 0); }
      else customerMap.set(name, { name, email: o.customer_email || '', phone: o.customer_phone || '', ordersCount: 1, totalSpent: Number(o.total || 0) });
    });
    setCustomers(Array.from(customerMap.values()));
  }, [orders]);

  if (checkingAuth) return (
    <motion.section className="section page authPage" {...pageVariants}>
      <p className="muted">{t.admChecking}</p>
    </motion.section>
  );

  if (!logged) return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LayoutDashboard size={28} />
          </motion.div>
          <span className="eyebrow">ADMIN</span>
          <h1>{t.admPanel}</h1>
          <p>{t.admProtected}</p>
          <Link className="btn primary full btnLg" to="/login"><LogIn size={18} /> {t.loginTitle}</Link>
        </div>
      </AnimateScale>
    </motion.section>
  );

  const tabs: [string, string, any][] = [
    ['dashboard', t.tabOverview, LayoutDashboard],
    ['orders', t.tabOrders, Package],
    ['designs', t.tabDesigns, Palette],
    ['products', t.tabProducts, Box],
    ['customers', t.tabCustomers, Users],
    ['coupons', t.tabCoupons, Tag],
    ['settings', t.tabSettings, Settings],
  ];

  return (
    <div className="admin">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <img src="/images/logo.jpeg" alt="ESRAA" className="adminLogo" />
          <div><b>ESRAA</b><small>ADMIN</small></div>
        </div>
        {tabs.map(([k, label, Icon]) => (
          <motion.button
            key={k}
            className={tab === k ? 'sidebarLink active' : 'sidebarLink'}
            onClick={() => setTab(k)}
            whileHover={{ x: uiLang === 'en' ? 5 : -5 }}
            whileTap={{ scale: .97 }}
          >
            <Icon size={18} />{label}
          </motion.button>
        ))}
        <button
          className="sidebarLogout"
          onClick={async () => {
            if (supabase) await supabase.auth.signOut();
            localStorage.removeItem('em-admin-demo');
            setLogged(false);
          }}
        >
          <LogOut size={18} /> {t.logout}
        </button>
      </aside>

      <main className="adminMain">
        <div className="adminTop">
          <div>
            <span className="eyebrow">ESRAA MOMENTS</span>
            <h1>{tabs.find(t => t[0] === tab)?.[1]}</h1>
          </div>
          <Link className="btn ghost" to="/"><Store size={16} /> {t.viewStore}</Link>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: .3 }}>
            {tab === 'dashboard' && <DashboardPanel orders={orders} products={products} t={t} onNavigate={setTab} />}
            {tab === 'designs' && <DesignsPanel t={t} />}
            {tab === 'products' && <ProductsAdmin products={products} setProducts={setProducts} t={t} />}
            {tab === 'orders' && <OrdersAdmin orders={orders} setOrders={setOrders} t={t} />}
            {tab === 'customers' && <CustomersAdmin customers={customers} orders={orders} t={t} />}
            {tab === 'coupons' && <CouponsAdmin coupons={coupons} setCoupons={setCoupons} t={t} />}
            {tab === 'settings' && <SettingsAdmin settings={settings} setSettings={setSettings} t={t} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardPanel({ orders, products, t, onNavigate }: { orders: Order[]; products: Product[]; t: typeof translations.ar; onNavigate: (tab: string) => void }) {
  const totalSales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const lowStock = products.filter(p => p.stock < 20);
  const recentOrders = orders.slice(0, 5);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Order', 'Customer', 'Phone', 'City', 'Subtotal', 'Shipping', 'Total', 'Payment', 'Date'],
      ...orders.map(o => [o.order_number, o.customer_name, o.customer_phone, o.city, o.subtotal ?? '', o.shipping_fee ?? '', o.total ?? '', paymentStatusLabel(o.payment_status) || o.payment_status || '', o.created_at?.slice(0, 10) || ''])
    ];
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = `esraa-orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <StaggerContainer className="statsGrid">
        {([
          { label: t.stSales, value: money(totalSales), Icon: TrendingUp, sub: t.stSalesSub },
          { label: t.stOrders, value: orders.length.toString(), Icon: Package, sub: t.stOrdersSub },
          { label: t.stProducts, value: products.length.toString(), Icon: Box, sub: t.stProductsSub },
          { label: t.stCustomers, value: new Set(orders.map(o => o.customer_name)).size.toString(), Icon: Users, sub: t.stCustomersSub },
        ] as const).map((item, i) => (
          <StaggerItem key={i}>
            <motion.div className="statCard" whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,.1)' }} transition={{ duration: .3 }}>
              <div className="statCardIcon"><item.Icon size={20} /></div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.sub}</small>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="adminGrid">
        <div className="adminPanel">
          <div className="panelHead">
            <h3><Clock size={18} /> {t.recentOrdersHead}</h3>
            <span className="muted">{orders.length} {t.ordersWord}</span>
          </div>
          <div className="adminTable">
            <div className="adminTableRow header">
              <span>{t.thOrderNo}</span><span>{t.thCustomer}</span><span>{t.thTotal}</span><span>{t.thPayStatus}</span><span>{t.thDate}</span>
            </div>
            {recentOrders.map(o => (
              <motion.div className="adminTableRow" key={o.id || o.order_number} whileHover={{ backgroundColor: 'var(--paper)' }}>
                <span><b>{o.order_number}</b></span>
                <span>{o.customer_name}</span>
                <span>{money(Number(o.total || 0))}</span>
                <span><span className="badge badgeWarning">{paymentStatusLabel(o.payment_status) || orderStatusLabel(o.status) || t.underReviewWord}</span></span>
                <small>{o.created_at ? new Date(o.created_at).toLocaleDateString(uiLang === 'en' ? 'en-US' : 'ar-EG') : '---'}</small>
              </motion.div>
            ))}
            {!recentOrders.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noOrdersYet}</span></div>}
          </div>
        </div>

        <div className="adminPanel">
          <div className="panelHead"><h3><AlertTriangle size={18} /> {t.stockHead}</h3></div>
          {lowStock.length > 0 ? lowStock.map(p => (
            <motion.div className="stockAlert" key={p.id} whileHover={{ x: 4 }}>
              <div className="stockAlertInfo"><Box size={14} /><span>{prodName(p)}</span></div>
              <div className="stockAlertBar"><i style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} /></div>
              <small>{p.stock} {t.piecesShort}</small>
            </motion.div>
          )) : <p className="muted">{t.allStockOk}</p>}

          <div className="panelHead" style={{ marginTop: 20 }}><h3><Sparkles size={18} /> {t.quickActionsHead}</h3></div>
          <div className="quickActions">
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={() => onNavigate('products')}><Plus size={16} /> {t.qaAddProduct}</motion.button>
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={exportCsv}><Download size={16} /> {t.qaExport}</motion.button>
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={() => onNavigate('coupons')}><Tag size={16} /> {t.qaCoupon}</motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

function DesignsPanel({ t }: { t: typeof translations.ar }) {
  const [designs, setDesigns] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      if (supabase) {
        const { data } = await supabase.from('custom_designs').select('*').order('created_at', { ascending: false }).limit(100);
        if (data) setDesigns(data);
      } else {
        setDesigns(getLocal<any[]>('em-designs', []).slice().reverse());
      }
    })();
  }, []);
  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Palette size={18} /> {t.tabDesigns}</h3>
        <span className="muted">{designs.length} {t.ordersWord}</span>
      </div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.sName}</span><span>{t.sOccasion}</span><span>{t.sType}</span><span>{t.sQty}</span><span>{t.sColor}</span><span>{t.sDate}</span>
        </div>
        {designs.map((d, i) => (
          <motion.div className="adminTableRow" key={d.id || i} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{d.inscription || d.reference || '---'}</b></span>
            <span>{occLabel(d.occasion)}</span>
            <span>{pickLabel(d.favor_type, favorTypeEn)}</span>
            <span>{d.quantity}</span>
            <span>{pickLabel(d.palette, colorEn)}</span>
            <small>{d.event_date || d.created_at?.slice(0, 10) || '---'}</small>
          </motion.div>
        ))}
        {!designs.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noDesigns}</span></div>}
      </div>
    </div>
  );
}

function ProductsAdmin({ products, setProducts, t }: { products: Product[]; setProducts: (p: Product[] | ((prev: Product[]) => Product[])) => void; t: typeof translations.ar }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'سبوع', price: '', stock: '', image: '', desc: '', featured: false });

  const resetForm = () => { setForm({ name: '', category: 'سبوع', price: '', stock: '', image: '', desc: '', featured: false }); setEditId(null); setShowForm(false); };
  const startEdit = (p: Product) => { setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), image: p.image, desc: p.desc, featured: !!p.featured }); setEditId(p.id); setShowForm(true); };

  const slugify = (name: string) => name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') || `p-${Date.now()}`;

  const saveProduct = async () => {
    if (!form.name || !form.price) return;
    if (supabase) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', form.category).maybeSingle();
      const payload = {
        name: form.name, description: form.desc, price: Number(form.price), stock: Number(form.stock),
        image_url: form.image || undefined, is_featured: form.featured, category_id: cat?.id ?? null
      };
      if (editId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editId);
        if (error) { alert(t.alertSaveFail + error.message); return; }
        setProducts(prev => prev.map(p => p.id === editId ? { ...p, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image, desc: form.desc, featured: form.featured } : p));
      } else {
        const { data, error } = await supabase.from('products').insert({ ...payload, slug: slugify(form.name) }).select().single();
        if (error) { alert(t.alertAddFail + error.message); return; }
        setProducts(prev => [...prev, { id: data.id, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image || seed[0].image, desc: form.desc, featured: form.featured }]);
      }
    } else if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image, desc: form.desc, featured: form.featured } : p));
    } else {
      setProducts(prev => [...prev, { id: `p${Date.now()}`, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image || seed[0].image, desc: form.desc, featured: form.featured }]);
    }
    resetForm();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm(uiLang === 'en' ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) { alert(t.alertDeleteFail + error.message); return; }
    }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Box size={18} /> {t.productsMgmt}</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X size={16} /> : <><Plus size={16} /> {t.addProduct}</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="adminForm" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
            <div className="formGrid">
              <label>{t.fName}<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label>{t.fCategory}<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{occasions.map(o => <option key={o} value={o}>{occLabel(o)}</option>)}</select></label>
              <label><DollarSign size={14} /> {t.fPrice}<input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
              <label><Package size={14} /> {t.fStock}<input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label>
              <label className="wide"><ImageIcon size={14} /> {t.fImage}<input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="/images/..." /></label>
              <label className="wide"><Edit3 size={14} /> {t.fDesc}<textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></label>
              <label className="wide checkboxLabel"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> <Star size={14} /> {t.fFeatured}</label>
            </div>
            <div className="formActions">
              <motion.button className="btn primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={saveProduct}><Check size={16} /> {editId ? t.updateBtn : t.addBtn}</motion.button>
              <motion.button className="btn ghost" whileTap={{ scale: .97 }} onClick={resetForm}>{t.cancelBtn}</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thImage}</span><span>{t.thProduct}</span><span>{t.thCategory}</span><span>{t.thPrice}</span><span>{t.thStock}</span><span>{t.thActions}</span>
        </div>
        <AnimatePresence>
          {products.map(p => (
            <motion.div className="adminTableRow" key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} whileHover={{ backgroundColor: 'var(--paper)' }}>
              <span><img src={p.image} alt={prodName(p)} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} /></span>
              <span><b>{prodName(p)}</b><small className="muted">{prodDesc(p).slice(0, 40)}...</small></span>
              <span>{occLabel(p.category)}</span>
              <span>{money(p.price)}</span>
              <span>{p.stock} {t.piecesShort}</span>
              <span className="tableActions">
                <button className="icon" onClick={() => startEdit(p)} title={t.editTitle}><Edit3 size={16} /></button>
                <button className="icon" onClick={() => deleteProduct(p.id)} title={t.delTitle} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrdersAdmin({ orders, setOrders, t }: { orders: Order[]; setOrders: (o: Order[]) => void; t: typeof translations.ar }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editShipping, setEditShipping] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');

  const payStateOptions: { value: string; label: string }[] = [
    { value: 'waiting_price', label: orderStatusLabels.ar.waiting_price },
    { value: 'unpaid', label: paymentStatusLabels.ar.unpaid },
    { value: 'proof_submitted', label: paymentStatusLabels.ar.proof_submitted },
    { value: 'paid', label: paymentStatusLabels.ar.paid },
  ];
  const payStateToLabel = (v: string) => paymentStatusLabels.ar[v] || orderStatusLabels.ar[v] || v;
  const labelToPayState = (label: string) => {
    for (const [code, lbl] of Object.entries({ ...paymentStatusLabels.ar, ...orderStatusLabels.ar })) if (lbl === label) return code;
    return 'unpaid';
  };

  const updateOrderPricing = async (o: Order) => {
    const newTotal = Number(editPrice || o.subtotal) + Number(editShipping || o.shipping_fee);
    const code = editPaymentStatus ? labelToPayState(editPaymentStatus) : 'unpaid';
    const updated = {
      ...o,
      subtotal: Number(editPrice || o.subtotal),
      shipping_fee: Number(editShipping || o.shipping_fee),
      total: newTotal,
      status: 'confirmed',
      payment_status: code
    };
    if (supabase) {
      const { error } = await supabase.from('orders').update({
        subtotal: updated.subtotal, shipping_fee: updated.shipping_fee, total: updated.total,
        status: 'confirmed', payment_status: code
      }).eq('id', o.id);
      if (error) { alert(t.alertUpdateFail + error.message); return; }
    } else {
      localStorage.setItem('em-all-orders', JSON.stringify(orders.map(x => x.order_number === o.order_number ? updated : x)));
    }
    setOrders(orders.map(x => (x.id === o.id || x.order_number === o.order_number) ? updated : x));
    setSelectedOrder(null);
    alert(t.alertPriceSaved);
  };

  const verifyPayment = async (o: Order) => {
    const updated = { ...o, status: 'processing', payment_status: 'paid' };
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status: 'processing', payment_status: 'paid' }).eq('id', o.id);
      if (error) { alert(t.alertUpdateFail + error.message); return; }
    } else {
      localStorage.setItem('em-all-orders', JSON.stringify(orders.map(x => x.order_number === o.order_number ? updated : x)));
    }
    setOrders(orders.map(x => (x.id === o.id || x.order_number === o.order_number) ? updated : x));
    setSelectedOrder(updated);
    alert(t.alertPaymentVerified);
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Package size={18} /> {t.ordersMgmt}</h3>
        <span className="muted">{orders.length} {t.ordersWord}</span>
      </div>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thOrderNo}</span><span>{t.thCustomer}</span><span>{t.thOccasion}</span><span>{t.thTotal}</span><span>{t.thPayStatus}</span><span>{t.thAction}</span>
        </div>
        {orders.map(o => (
          <motion.div className="adminTableRow" key={o.id || o.order_number} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{o.order_number}</b></span>
            <span>{o.customer_name}<br /><small className="muted">{o.customer_phone}</small></span>
            <span>{occLabel(o.occasion)}</span>
            <span><b>{money(Number(o.total || 0))}</b></span>
            <span><span className="badge badgeWarning">{paymentStatusLabel(o.payment_status) || orderStatusLabel(o.status) || t.underReviewWord}</span></span>
            <span>
              <motion.button className="btn btn-sm primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { setSelectedOrder(o); setEditPrice(String(o.subtotal || 0)); setEditShipping(String(o.shipping_fee || 25)); const known = paymentStatusLabels.ar[o.payment_status] || orderStatusLabels.ar[o.payment_status] ? o.payment_status : 'unpaid'; setEditPaymentStatus(payStateToLabel(known)); }}>
                {t.reviewConfirm} <Eye size={14} />
              </motion.button>
            </span>
          </motion.div>
        ))}
        {!orders.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>{t.noOrdersSoFar}</span></div>}
      </div>

      {selectedOrder && (
        <div className="modalOverlay" onClick={() => setSelectedOrder(null)}>
          <div className="modalCard" onClick={e => e.stopPropagation()}>
            <div className="modalHead">
              <h3>{t.reviewDetails} {selectedOrder.order_number}</h3>
              <button className="icon" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modalBody" style={{ display: 'grid', gap: 16 }}>
              <p><b>{t.customerL}</b> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p><b>{t.addressL}</b> {selectedOrder.city} - {selectedOrder.address}</p>
              <p><b>{t.occasionL}</b> {occLabel(selectedOrder.occasion)}</p>
              <p><b>{t.notesL}</b> {selectedOrder.notes || '---'}</p>

              <hr />
              <h4>{t.setFinalHead}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>{t.finalPriceL}
                  <input type="number" className="input" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                </label>
                <label>{t.shippingL}
                  <input type="number" className="input" value={editShipping} onChange={e => setEditShipping(e.target.value)} />
                </label>
              </div>
              <label>{t.payStatusL}
                <select className="select" value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
                  {payStateOptions.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
                </select>
              </label>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <motion.button className="btn primary" whileTap={{ scale: .96 }} onClick={() => updateOrderPricing(selectedOrder)}>
                  {t.saveConfirmBtn}
                </motion.button>
                {(selectedOrder.payment_status === 'proof_submitted' || selectedOrder.payment_status?.includes('تم رفع')) && (
                  <motion.button className="btn" style={{ background: 'var(--success)', color: '#fff' }} whileTap={{ scale: .96 }} onClick={() => verifyPayment(selectedOrder)}>
                    <Check size={16} /> {t.verifyBtn}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersAdmin({ customers, orders, t }: { customers: Customer[]; orders: Order[]; t: typeof translations.ar }) {
  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Users size={18} /> {t.customersMgmt}</h3>
        <span className="muted">{customers.length} {t.customersWord}</span>
      </div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thCustName}</span><span>{t.thPhone}</span><span>{t.thEmail}</span><span>{t.thOrdersCount}</span><span>{t.thSpent}</span>
        </div>
        {customers.map((c, i) => (
          <motion.div className="adminTableRow" key={i} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.name}</b></span>
            <span dir="ltr">{c.phone || '---'}</span>
            <span>{c.email || '---'}</span>
            <span>{c.ordersCount} {t.ordersCountSuffix}</span>
            <span className="priceGrad"><b>{money(c.totalSpent)}</b></span>
          </motion.div>
        ))}
        {!customers.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noCustomers}</span></div>}
      </div>
    </div>
  );
}

function CouponsAdmin({ coupons, setCoupons, t }: { coupons: Coupon[]; setCoupons: (c: Coupon[]) => void; t: typeof translations.ar }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '10', type: 'percent' as 'percent' | 'fixed', maxUsage: '100', expiry: '' });

  const addCoupon = async () => {
    if (!form.code || !form.discount) return;
    const code = form.code.trim().toUpperCase();
    if (supabase) {
      const { data, error } = await supabase.from('coupons').insert({
        code, discount_type: form.type, amount: Number(form.discount),
        usage_limit: form.maxUsage ? Number(form.maxUsage) : null, expires_at: form.expiry || null, is_active: true
      }).select().single();
      if (error) { alert(t.alertCouponFail + error.message); return; }
      setCoupons([...coupons, { id: data.id, code, discount: Number(form.discount), type: form.type, maxUsage: Number(form.maxUsage) || Infinity, usageCount: 0, minOrder: 0, expiry: form.expiry, active: true }]);
    } else {
      setCoupons([...coupons, { id: `c${Date.now()}`, code, discount: Number(form.discount), type: form.type, maxUsage: Number(form.maxUsage) || Infinity, usageCount: 0, minOrder: 0, expiry: form.expiry, active: true }]);
    }
    setForm({ code: '', discount: '10', type: 'percent', maxUsage: '100', expiry: '' });
    setShowForm(false);
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Tag size={18} /> {t.couponsMgmt}</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <><Plus size={16} /> {t.addCoupon}</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="adminForm" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
            <div className="formGrid">
              <label>{t.cCode}<input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MOMENTS10" /></label>
              <label>{t.cType}<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}><option value="percent">{t.cPercent}</option><option value="fixed">{t.cFixed}</option></select></label>
              <label>{t.cValue}<input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} /></label>
              <label>{t.cMaxUse}<input type="number" min="0" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} /></label>
              <label>{t.cExpiry}<input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} /></label>
            </div>
            <div className="formActions">
              <motion.button className="btn primary" whileTap={{ scale: .97 }} onClick={addCoupon}><Check size={16} /> {t.addBtn}</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>{t.thCode}</span><span>{t.thDiscount}</span><span>{t.thMin}</span><span>{t.thUsage}</span><span>{t.thStatus}</span>
        </div>
        {coupons.map(c => (
          <motion.div className="adminTableRow" key={c.id} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.code}</b></span>
            <span>{c.type === 'percent' ? `${c.discount}%` : money(c.discount)}</span>
            <span>{money(c.minOrder)}</span>
            <span>{c.usageCount} / {c.maxUsage === Infinity ? '∞' : c.maxUsage}</span>
            <span><span className={c.active ? 'badge badgeSuccess' : 'badge badgeWarning'}>{c.active ? t.activeC : t.inactiveC}</span></span>
          </motion.div>
        ))}
        {!coupons.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>{t.noCoupons}</span></div>}
      </div>
    </div>
  );
}

function SettingsAdmin({ settings, setSettings, t }: { settings: any; setSettings: any; t: typeof translations.ar }) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (supabase) {
      const { error } = await supabase.from('settings').upsert({
        key: 'store',
        value: {
          name: settings.storeName, shippingFee: Number(settings.shippingFee) || 0,
          freeShippingOver: Number(settings.freeShippingThreshold) || 0,
          phone: settings.phone,
          whatsapp: settings.whatsapp, instagram: settings.instagram, tiktok: settings.tiktok
        }
      });
      setSaving(false);
      if (error) { alert(t.alertSettingsFail + error.message); return; }
    } else {
      localStorage.setItem('em-settings', JSON.stringify(settings));
      setSaving(false);
    }
    alert(t.alertSettingsSaved);
  };

  return (
    <div className="adminPanel">
      <div className="panelHead"><h3><Settings size={18} /> {t.settingsMgmt}</h3></div>
      <div className="formGrid" style={{ marginTop: 20 }}>
        <label>{t.setName}<input className="input" value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} /></label>
        <label>{t.setPayPhone}<input className="input" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} /></label>
        <label>{t.setShipFee}<input className="input" value={settings.shippingFee} onChange={e => setSettings({ ...settings, shippingFee: e.target.value })} /></label>
        <label>{t.setFreeShip}<input className="input" value={settings.freeShippingThreshold} onChange={e => setSettings({ ...settings, freeShippingThreshold: e.target.value })} /></label>
        <label>{t.setWhats}<input className="input" value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} dir="ltr" /></label>
        <label>{t.setInsta}<input className="input" value={settings.instagram} onChange={e => setSettings({ ...settings, instagram: e.target.value })} dir="ltr" /></label>
        <label>{t.setTiktok}<input className="input" value={settings.tiktok} onChange={e => setSettings({ ...settings, tiktok: e.target.value })} dir="ltr" /></label>
        <label className="wide">{t.setDesc}<textarea className="textarea" value={settings.storeDesc} onChange={e => setSettings({ ...settings, storeDesc: e.target.value })} /></label>
      </div>
      <motion.button className="btn primary" style={{ marginTop: 24 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={save} disabled={saving}>
        {saving ? t.savingBtn : t.saveSettings}
      </motion.button>
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
