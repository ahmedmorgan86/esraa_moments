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
import { Analytics } from '@vercel/analytics/react';
import './styles.css';

type Product = { id: string; name: string; category: string; price: number; stock: number; image: string; desc: string; featured?: boolean; isStartingFrom?: boolean };
type CartItem = Product & { qty: number };
type Design = { occasion: string; type: string; qty: number; color: string; name: string; date: string; extras: string };
type Coupon = { id: string; code: string; discount: number; type: 'percent' | 'fixed'; maxUsage: number; usageCount: number; minOrder: number; expiry: string; active: boolean };
type Order = {
  id: string;
  order_number: string;
  orderNo?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  city: string;
  address: string;
  occasion: string;
  notes: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  payment_status: string;
  payment_proof?: string;
  created_at: string;
};
type Customer = { name: string; email: string; phone: string; ordersCount: number; totalSpent: number };

const occasions = [
  'سبوع', 'خطوبة', 'حنة', 'كتب كتاب', 'زفاف',
  'عيد ميلاد', 'تخرج', 'استقبال مولود', 'رمضان', 'عيد', 'توزيعات شركات'
];

const translations = {
  ar: {
    store: 'المتجر',
    designStudio: 'صممي توزيعتك',
    aboutUs: 'من نحن',
    faq: 'الأسئلة الشائعة',
    track: 'تتبعي طلبك',
    login: 'تسجيل الدخول',
    cart: 'سلة الطلب',
    browseShop: 'تصفحي المتجر',
    heroEyebrow: 'HANDCRAFTED • PERSONALIZED • TIMELESS',
    heroTitle: 'تفاصيل صغيرة…\nتصنع لحظات لا تُنسى.',
    heroDesc: 'توزيعات وهدايا مصممة بعناية لكل مناسبة، من أول فكرة حتى آخر تفصيلة.',
    exploreFavors: 'اكتشفي التوزيعات',
    designYourWay: 'صممي توزيعتك',
    chooseOccasion: 'اختاري مناسبتك',
    occasionsSub: 'لكل لحظة طابعها الخاص، ولكل طابع تفاصيله.',
    curated: 'اختياراتنا المميزة',
    allCollection: 'شاهدي المجموعة كاملة',
    bestSellers: 'الأكثر مبيعاً',
    viewAll: 'شاهدي الكل',
    stayConnected: 'ابقي على تواصل',
    subscribeText: 'سجّلي للحصول على أحدث التصاميم والعروض الحصرية مباشرة في بريدك.',
    subscribeBtn: 'اشتركي',
    faqTitle: 'الأسئلة الشائعة',
    letsCreate: 'LET\'S CREATE',
    transforming: '-transforming moments into memories-',
    startJourney: 'ابدئي رحلتك',
    searchPlaceholder: 'ابحثي عن توزيعة…',
    addToCart: 'أضيفي للسلة',
    saved: 'محفوظة',
    save: 'حفظ',
    productDetails: 'تفاصيل المنتج',
    checkout: 'إتمام الطلب',
    orderSummary: 'ملخص الطلب',
    subtotal: 'المنتجات',
    shipping: 'الشحن',
    free: 'مجاني',
    total: 'الإجمالي',
    confirmOrder: 'تأكيد الطلب',
    paymentMethod: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام',
    instapay: 'إنستاباي / محفظة إلكترونية',
    card: 'بطاقة ائتمانية',
    paymentInstructionsTitle: 'تعليمات الدفع والتحويل',
    paymentInstructionsText: 'يرجى التحويل عبر إنستاباي أو المحفظة الإلكترونية إلى رقم: 01000000000 ثم رفع صورة الإيصال أدناه.',
    uploadProof: 'رفع إيصال الدفع',
    paymentStatus: 'حالة الدفع',
    statuses: {
      new: 'طلب جديد',
      underReview: 'قيد المراجعة',
      priceConfirmed: 'تم تأكيد السعر',
      waitingPayment: 'بانتظار الدفع',
      proofSubmitted: 'تم رفع إيصال الدفع',
      verified: 'تم التحقق من الدفع',
      paid: 'مدفوع',
      preparing: 'قيد التجهيز',
      production: 'قيد الإنتاج',
      ready: 'جاهز',
      shipped: 'تم الشحن',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }
  },
  en: {
    store: 'Shop',
    designStudio: 'Custom Studio',
    aboutUs: 'About Us',
    faq: 'FAQ',
    track: 'Track Order',
    login: 'Login',
    cart: 'Shopping Bag',
    browseShop: 'Explore Collection',
    heroEyebrow: 'HANDCRAFTED • PERSONALIZED • TIMELESS',
    heroTitle: 'Exquisite details…\nfor unforgettable moments.',
    heroDesc: 'Thoughtfully crafted custom event favors and gifts for every celebration.',
    exploreFavors: 'Explore Favors',
    designYourWay: 'Design Your Favor',
    chooseOccasion: 'Shop By Occasion',
    occasionsSub: 'Every moment has its unique character and refined details.',
    curated: 'Curated Collection',
    allCollection: 'View Complete Collection',
    bestSellers: 'Best Sellers',
    viewAll: 'View All',
    stayConnected: 'Stay Connected',
    subscribeText: 'Subscribe to receive the latest designs and exclusive offers in your inbox.',
    subscribeBtn: 'Subscribe',
    faqTitle: 'Frequently Asked Questions',
    letsCreate: 'LET\'S CREATE',
    transforming: '-transforming moments into memories-',
    startJourney: 'Begin Journey',
    searchPlaceholder: 'Search favor…',
    addToCart: 'Add to Bag',
    saved: 'Saved',
    save: 'Save',
    productDetails: 'Product Details',
    checkout: 'Checkout',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    confirmOrder: 'Confirm Order',
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery',
    instapay: 'InstaPay / Mobile Wallet',
    card: 'Credit Card',
    paymentInstructionsTitle: 'Payment & Transfer Instructions',
    paymentInstructionsText: 'Please transfer via InstaPay or Mobile Wallet to: 01000000000 and upload your receipt below.',
    uploadProof: 'Upload Payment Proof',
    paymentStatus: 'Payment Status',
    statuses: {
      new: 'New Request',
      underReview: 'Under Review',
      priceConfirmed: 'Price Confirmed',
      waitingPayment: 'Waiting for Payment',
      proofSubmitted: 'Payment Proof Submitted',
      verified: 'Payment Verified',
      paid: 'Paid',
      preparing: 'Preparing',
      production: 'In Production',
      ready: 'Ready',
      shipped: 'Shipped',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
  }
};

const seed: Product[] = [
  { id: 'p1', name: 'توزيعة سبوع الدبدوب الملكي', category: 'سبوع', price: 35, stock: 120, image: '/images/Gemini_Generated_Image_wh7xokwh7xokwh7x.jpeg', desc: 'مجسم دبدوب فاخر مع زجاجة مسك أبيض وكرت ترحيب بالطفل.', featured: true },
  { id: 'p2', name: 'توزيعة سبوع الحوت والسبحة', category: 'سبوع', price: 30, stock: 150, image: '/images/Gemini_Generated_Image_sligebsligebslig.jpeg', desc: 'عداد تسبيح رقمي مع شوكولاتة مستوردة في علبة أنيقة.', featured: true },
  { id: 'p3', name: 'عقد اللؤلؤ والخطوبة الكلاسيكي', category: 'خطوبة', price: 36, stock: 60, image: '/images/Gemini_Generated_Image_p97awfp97awfp97a.jpeg', desc: 'كرت عريض برسمة خاتم الخطوبة مع سوار أنيق من اللؤلؤ.', featured: true },
  { id: 'p4', name: 'بوكس الأكريليك المذهب للخطوبة', category: 'خطوبة', price: 42, stock: 40, image: '/images/Gemini_Generated_Image_p2yjpfp2yjpfp2yj.jpeg', desc: 'علبة أكريليك فاخرة بداخلها شوكولاتة ومسك مع شريطة ذهبية.', featured: true },
  { id: 'p5', name: 'توزيعات حنة الورود المخملية', category: 'حنة', price: 28, stock: 80, image: '/images/Gemini_Generated_Image_wl5xnywl5xnywl5x.jpeg', desc: 'كرت فاخر بتصميم يدوي مع شوكولاتة قلب حمراء وزهور مجففة.', featured: true },
  { id: 'p6', name: 'مانيكير وفراشة الحنة ثلاثية الأبعاد', category: 'حنة', price: 26, stock: 60, image: '/images/Gemini_Generated_Image_vh32ruvh32ruvh32.jpeg', desc: 'طلاء أظافر بألوان أنثوية مع أجنحة فراشة مفرغة يدوياً.', featured: true },
  { id: 'p7', name: 'مسك الختام والعود الملكي', category: 'كتب كتاب', price: 38, stock: 70, image: '/images/Gemini_Generated_Image_vkeew8vkeew8vkee.jpeg', desc: 'زجاجة عطرية كريستالية مع كرت شكر وتقدير لضيوف كتب الكتاب.', featured: true },
  { id: 'p8', name: 'شموع الصويا الطبيعية باللؤلؤ', category: 'كتب كتاب', price: 45, stock: 50, image: '/images/Gemini_Generated_Image_q2ritlq2ritlq2ri.jpeg', desc: 'شمعة صويا معطرة بعبير الياسمين مزينة بحبات لؤلؤ وشريط ساتان.', featured: true },
  { id: 'p9', name: 'مروحة ورقية مذهبة للزفاف', category: 'زفاف', price: 35, stock: 100, image: '/images/Gemini_Generated_Image_w92zqyw92zqyw92z.jpeg', desc: 'مروحة ورقية بتطريز وردي وطباعة أسماء العروسين بماء الذهب.', featured: true },
  { id: 'p10', name: 'بوكس زفاف الورد والذهب', category: 'زفاف', price: 50, stock: 20, image: '/images/Gemini_Generated_Image_ehh0puehh0puehh0.jpeg', desc: 'بوكس هدية كبير بلمسات روز جولد وزهور طبيعية.', featured: true },
  { id: 'p11', name: 'توزيعات عيد الميلاد بالبالون والكرت', category: 'عيد ميلاد', price: 25, stock: 90, image: '/images/Gemini_Generated_Image_o7uafio7uafio7ua.jpeg', desc: 'شوكولاتة مخصصة مع كرت عيد ميلاد مرح وملون.', featured: true },
  { id: 'p12', name: 'توزيعات التخرج بقبعة الأكاديمية', category: 'تخرج', price: 32, stock: 75, image: '/images/Gemini_Generated_Image_o2jvt3o2jvt3o2jv.jpeg', desc: 'مجسم قبعة تخرج مع بطاقة تهنئة وخريطة إنجاز.', featured: true },
  { id: 'p13', name: 'استقبال مولود زهور ولبان دكر', category: 'استقبال مولود', price: 30, stock: 110, image: '/images/Gemini_Generated_Image_pbsa2xpbsa2xpbsa.jpeg', desc: 'توزيعات أنيقة للمستشفى والتهنئة بالمولود الجديد.', featured: true },
  { id: 'p14', name: 'فانوس رمضان والأذكار الفاخرة', category: 'رمضان', price: 40, stock: 130, image: '/images/Gemini_Generated_Image_i6nilyi6nilyi6ni.jpeg', desc: 'فانوس أكريليك مصغر مع بطاقة أدعية رمضانية.', featured: true },
  { id: 'p15', name: 'عيدية العيد الفاخرة في مغلف مذهب', category: 'عيد', price: 20, stock: 200, image: '/images/Gemini_Generated_Image_hlt09bhlt09bhlt0.jpeg', desc: 'مغلف عيدية مطبوع بعبارات العيد السعيد وتصميم راقٍ.', featured: true },
  { id: 'p16', name: 'توزيعات الشركات وهدايا العملاء', category: 'توزيعات شركات', price: 60, stock: 90, image: '/images/Gemini_Generated_Image_etc9loetc9loetc9.jpeg', desc: 'علبة هدايا رسمية بشعار الشركة ومنتجات عطرية فاخرة.', featured: true },
];

const money = (n: number) => `${n.toLocaleString('ar-EG')} ج.م`;
const getLocal = <T,>(k: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fallback } catch { return fallback } };
const ease: [number, number, number, number] = [.22, 1, .36, 1];

function AnimateScroll({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string; [k: string]: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(8px)' }}
      transition={{ duration: .7, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function AnimateScale({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string; [k: string]: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: .85, rotate: -2 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: .85, rotate: -2 }}
      transition={{ duration: .6, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ visible: { transition: { staggerChildren: .12 } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: .96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .5, ease } }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: .5, ease } as const },
  exit: { opacity: 0, y: -20, filter: 'blur(6px)', transition: { duration: .3 } }
};

function useProducts() {
  const [items, setItems] = useState<Product[]>(seed);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from('products').select('id,name,price,stock,image_url,description,categories(name)').eq('is_active', true);
      if (active && data?.length) setItems(data.map((p: any) => ({
        id: p.id, name: p.name, category: p.categories?.name || 'مناسبات خاصة',
        price: Number(p.price), stock: p.stock, image: p.image_url || seed[0].image, desc: p.description || ''
      })));
    })();
    return () => { active = false };
  }, []);
  return items;
}

function useLocalStorage<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => getLocal(key, fallback));
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

function useScrollShadow() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

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
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [location.pathname]);

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
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Footer t={t} />
    </div>
  );
}

function Header({
  cartCount, menu, setMenu, dark, setDark, lang, setLang, t, onCartClick
}: {
  cartCount: number; menu: boolean; setMenu: (v: boolean) => void;
  dark: boolean; setDark: (v: boolean) => void;
  lang: 'ar' | 'en'; setLang: (l: 'ar' | 'en') => void;
  t: typeof translations.ar; onCartClick: () => void;
}) {
  const scrolled = useScrollShadow();
  return (
    <motion.header
      className={`header ${scrolled ? 'headerScrolled' : ''}`}
      initial={{ y: -82 }}
      animate={{ y: 0 }}
      transition={{ duration: .6, ease }}
    >
      <button className="icon mobileOnly" onClick={() => setMenu(!menu)} aria-label="Menu">
        <motion.div whileTap={{ rotate: 90 }} transition={{ duration: .2 }}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </motion.div>
      </button>

      <Link to="/" className="brand">
        <motion.span className="brandMark" whileHover={{ scale: 1.08 }} transition={{ duration: .4 }}>
          <img src="/images/logo.jpeg" alt="Esraa Moments" />
        </motion.span>
        <span className="brandText"><b>ESRAA</b><small>Moments</small></span>
      </Link>

      <nav className={menu ? 'nav open' : 'nav'}>
        <Link to="/shop" onClick={() => setMenu(false)}>{t.store}</Link>
        <Link to="/custom" onClick={() => setMenu(false)}>{t.designStudio}</Link>
        <a href="/#about" onClick={() => setMenu(false)}>{t.aboutUs}</a>
        <a href="/#faq" onClick={() => setMenu(false)}>{t.faq}</a>
        <Link to="/track" onClick={() => setMenu(false)}>{t.track}</Link>
      </nav>

      <div className="headerActions">
        <motion.button
          className="langToggleBtn"
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: .95 }}
          title="Switch Language"
        >
          <Globe size={16} /> <span>{lang === 'ar' ? 'EN' : 'العربية'}</span>
        </motion.button>

        <motion.button
          className="icon"
          onClick={() => setDark(!dark)}
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: .9 }}
          transition={{ duration: .4 }}
          aria-label="Toggle Theme"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        <motion.button className="icon cartTrigger" onClick={onCartClick} whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }} aria-label="Cart">
          <ShoppingBag size={20} />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.i
                className="cartBadge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              >
                {cartCount}
              </motion.i>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.header>
  );
}

function CartDrawer({
  open, onClose, cart, changeQty, remove, total, t
}: {
  open: boolean; onClose: () => void; cart: CartItem[];
  changeQty: (id: string, d: number) => void; remove: (id: string) => void;
  total: number; t: typeof translations.ar;
}) {
  const shipping = total >= 500 || !total ? 0 : 25;
  const nav = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cartOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .3 }}
            onClick={onClose}
          />
          <motion.div
            className="cartDrawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: .4, ease }}
          >
            <div className="cartDrawerHead">
              <h2><ShoppingBag size={20} /> {t.cart}</h2>
              <motion.button className="icon" onClick={onClose} whileHover={{ rotate: 90 }} whileTap={{ scale: .9 }}>
                <X size={22} />
              </motion.button>
            </div>

            {!cart.length ? (
              <div className="cartEmpty">
                <ShoppingBag size={48} strokeWidth={1} />
                <h3>السلة فاضية</h3>
                <p>ابدئي التسوق واكتشفي توزيعاتنا المميزة</p>
                <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .96 }} onClick={() => { onClose(); nav('/shop'); }}>
                  {t.browseShop}
                </motion.button>
              </div>
            ) : (
              <>
                <div className="cartDrawerItems">
                  <AnimatePresence initial={false}>
                    {cart.map(item => (
                      <motion.div
                        className="cartDrawerItem"
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, padding: 0 }}
                        transition={{ duration: .3, ease }}
                      >
                        <img src={item.image} alt={item.name} className="cartDrawerImg" />
                        <div className="cartDrawerInfo">
                          <Link to={`/product/${item.id}`} onClick={onClose}>{item.name}</Link>
                          <span className="cartDrawerPrice">{money(item.price)}</span>
                          <div className="qtyControls">
                            <motion.button whileTap={{ scale: .8 }} onClick={() => changeQty(item.id, -1)}><Minus size={14} /></motion.button>
                            <span>{item.qty}</span>
                            <motion.button whileTap={{ scale: .8 }} onClick={() => changeQty(item.id, 1)}><Plus size={14} /></motion.button>
                          </div>
                        </div>
                        <div className="cartDrawerRight">
                          <span className="cartDrawerLineTotal">{money(item.price * item.qty)}</span>
                          <motion.button className="icon removeBtn" whileHover={{ scale: 1.2, color: '#a44' }} whileTap={{ scale: .8 }} onClick={() => remove(item.id)}>
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="cartDrawerFoot">
                  <div className="cartDrawerSummary">
                    <div><span>{t.subtotal}</span><b>{money(total)}</b></div>
                    <div><span>{t.shipping}</span><b className={shipping === 0 ? 'freeShipping' : ''}>{shipping ? money(shipping) : t.free}</b></div>
                    {total < 500 && total > 0 && <p className="shippingHint">شحن مجاني للطلبات فوق 500 ج.م</p>}
                    <hr />
                    <div className="cartDrawerGrand"><span>{t.total}</span><b>{money(total + shipping)}</b></div>
                  </div>
                  <motion.button
                    className="btn primary full"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: .97 }}
                    onClick={() => { onClose(); nav('/checkout'); }}
                  >
                    {t.checkout} <ArrowLeft size={18} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProductCard({ p, addToCart, wish, setWish }: { p: Product; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void }) {
  const liked = wish.includes(p.id);
  return (
    <motion.article
      className="productCard"
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(50,30,20,.12)' }}
      transition={{ duration: .4, ease }}
    >
      <Link to={`/product/${p.id}`} className="productCardImage">
        <motion.img src={p.image} alt={p.name} whileHover={{ scale: 1.05 }} transition={{ duration: .7, ease }} />
        <motion.button
          type="button"
          className="wishBtn"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: .8 }}
          onClick={e => { e.preventDefault(); setWish(liked ? wish.filter(x => x !== p.id) : [...wish, p.id]); }}
          aria-label="Wishlist"
        >
          <Heart fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} size={18} />
        </motion.button>
        <span className="productCatTag">{p.category}</span>
      </Link>
      <div className="productCardBody">
        <Link to={`/product/${p.id}`}><h3>{p.name}</h3></Link>
        <p className="productDesc">{p.desc}</p>
        <div className="productCardFooter">
          <strong className="priceGrad">{money(p.price)}</strong>
          <motion.button
            className="addCartBtn"
            whileHover={{ scale: 1.05, backgroundColor: 'var(--ink)', color: 'var(--bg)' }}
            whileTap={{ scale: .95 }}
            onClick={() => addToCart(p)}
          >
            أضيفي <Plus size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function Home({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const faqData = [
    { q: 'كم يستغرق تجهيز الطلب؟', a: 'عادة من 3 إلى 5 أيام عمل، ثم الشحن خلال 24-48 ساعة. الطلبات الكبيرة قد تحتاج وقتاً إضافياً.' },
    { q: 'ما الحد الأدنى للطلب؟', a: 'الحد الأدنى 15 قطعة للتوزيعات المخصصة. للمنتجات الجاهزة لا يوجد حد أدنى.' },
    { q: 'هل يمكن معاينة العينة؟', a: 'نعم، نرسل صور وفيديو للعينة الأولى قبل البدء بالكمية لضمان رضاكِ التام.' },
    { q: 'ما طرق الدفع المتاحة؟', a: 'إنستاباي، المحافظ الإلكترونية، والتحويل بعد تأكيد السعر والشحن النهائي.' },
    { q: 'هل الشحن مجاني؟', a: 'نعم، الشحن مجاني للطلبات فوق 500 ج.م. رسوم الشحن الافتراضية 25 ج.م.' }
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const bestSellers = useMemo(() => [...products].sort((a, b) => b.stock - a.stock).slice(0, 6), [products]);

  return (
    <>
      <section className="hero">
        <div className="heroCopy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .7, delay: .2, ease }}
          >
            {t.heroEyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: .4, ease }}
          >
            تفاصيل صغيرة…<br /><em>تصنع لحظات</em> لا تُنسى.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7, delay: .6, ease }}
          >
            توزيعات وهدايا مصممة بعناية لكل مناسبة، من أول فكرة حتى آخر تفصيلة.
          </motion.p>
          <motion.div
            className="heroCta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .8, ease }}
          >
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: .96 }}>
              <Link className="btn primary btnLg" to="/shop">{t.exploreFavors} <ArrowLeft size={18} /></Link>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: .96 }}>
              <Link className="btn ghost btnLg" to="/custom">{t.designYourWay} <Sparkles size={18} /></Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="scrollIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronDown size={24} />
            </motion.div>
          </motion.div>
        </div>
        <div className="heroImage">
          <motion.img
            src="/images/Gemini_Generated_Image_ehh0puehh0puehh0.jpeg"
            alt="Esraa Moments"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: .3, ease }}
          />
          <motion.div
            className="floatingBadge"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8, delay: 1 }}
            whileHover={{ y: -5 }}
          >
            مصنوعة بحب<br /><small>For your moments</small>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="sectionHead">
          <AnimateScroll>
            <div><span className="eyebrow">YOUR OCCASION</span><h2>{t.chooseOccasion}</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <p>{t.occasionsSub}</p>
          </AnimateScroll>
        </div>
        <StaggerContainer className="occasionGrid">
          {occasions.map((o, i) => (
            <StaggerItem key={o}>
              <motion.div whileHover={{ x: -12, backgroundColor: 'var(--paper)' }} transition={{ duration: .3, ease }}>
                <Link to={`/shop?cat=${encodeURIComponent(o)}`} className="occasionCard">
                  <span className="occasionNum">{i < 9 ? `0${i + 1}` : i + 1}</span>
                  <b>{o}</b>
                  <ArrowLeft size={18} />
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section" id="shop">
        <div className="sectionHead">
          <AnimateScroll>
            <div><span className="eyebrow">CURATED COLLECTION</span><h2>{t.curated}</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <Link className="textLink" to="/shop">{t.allCollection} <ArrowLeft size={16} /></Link>
          </AnimateScroll>
        </div>
        <StaggerContainer className="productGrid">
          {products.filter(x => x.featured).map(p => (
            <StaggerItem key={p.id}>
              <ProductCard p={p} addToCart={addToCart} wish={wish} setWish={setWish} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section brandStory" id="about">
        <div className="brandStoryInner">
          <AnimateScroll>
            <span className="eyebrow">OUR STORY</span>
            <h2>لمساتنا <em>الفريدة</em></h2>
            <blockquote className="storyQuote">
              كل توزيعة تحكي قصة. نستخدم أجود الخامات وأرقى التصاميم لنصنع لحظات لا تُنسى لمناسبتك.
            </blockquote>
            <p>
              من اختيار الورود الطبيعية حتى آخر طبقة ذهبي، كل تفصيلة مصممة بعناية. نؤمن بأن اللحظات الجميلة تستحق تفاصيل لا تُنسى.
            </p>
          </AnimateScroll>
        </div>
        <div className="brandStoryImages">
          <AnimateScroll delay={.1}>
            <motion.img
              src="/images/Gemini_Generated_Image_hlt09bhlt09bhlt0.jpeg"
              alt="لمساتنا"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: .5, ease }}
            />
          </AnimateScroll>
          <AnimateScroll delay={.2}>
            <motion.img
              src="/images/Gemini_Generated_Image_etc9loetc9loetc9.jpeg"
              alt="تفاصيل"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: .5, ease }}
            />
          </AnimateScroll>
        </div>
      </section>

      <section className="section" id="bestsellers">
        <div className="sectionHead">
          <AnimateScroll>
            <div><span className="eyebrow">BEST SELLERS</span><h2>{t.bestSellers}</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <Link className="textLink" to="/shop">{t.viewAll} <ArrowLeft size={16} /></Link>
          </AnimateScroll>
        </div>
        <div className="bestSellersScroll">
          {bestSellers.map((p, i) => (
            <motion.div
              key={p.id}
              className="bestSellerCard"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * .1, duration: .5, ease }}
            >
              <Link to={`/product/${p.id}`}>
                <img src={p.image} alt={p.name} />
                <div>
                  <span className="bsRank">#{i + 1}</span>
                  <h4>{p.name}</h4>
                  <strong className="priceGrad">{money(p.price)}</strong>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section newsletter">
        <AnimateScroll>
          <div className="newsletterInner">
            <span className="eyebrow">STAY CONNECTED</span>
            <h2>{t.stayConnected}</h2>
            <p>{t.subscribeText}</p>
            <div className="newsletterForm">
              <input type="email" placeholder="بريدك الإلكتروني" />
              <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
                <Send size={16} /> {t.subscribeBtn}
              </motion.button>
            </div>
          </div>
        </AnimateScroll>
      </section>

      <section className="section faq" id="faq">
        <AnimateScroll>
          <div className="sectionHead center">
            <div><span className="eyebrow">FAQ</span><h2>{t.faqTitle}</h2></div>
          </div>
        </AnimateScroll>
        <StaggerContainer className="faqList">
          {faqData.map((f, i) => (
            <StaggerItem key={i}>
              <motion.div
                className={`faqItem ${openFaq === i ? 'open' : ''}`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: .2 }}
              >
                <motion.button
                  className="faqQ"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  whileHover={{ x: 4 }}
                >
                  {f.q}
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: .3 }}>
                    <ChevronDown size={18} />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: .3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="faqA">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <motion.section
        className="ctaBanner"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: .8 }}
      >
        <span className="eyebrow">{t.letsCreate}</span>
        <h2>{t.transforming}</h2>
        <motion.div whileHover={{ y: -4, boxShadow: '0 15px 40px rgba(0,0,0,.25)' }} whileTap={{ scale: .96 }}>
          <Link className="btn light btnLg" to="/custom">{t.startJourney} <Sparkles size={18} /></Link>
        </motion.div>
      </motion.section>
    </>
  );
}

function ShopPage({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const location = useLocation();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(new URLSearchParams(location.search).get('cat') || '');
  const [sort, setSort] = useState('الكل');

  const filtered = useMemo(() => {
    let items = products.filter(p => (!cat || p.category === cat) && (p.name + p.category + p.desc).includes(q));
    if (sort === 'الأقل سعراً') items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === 'الأعلى سعراً') items = [...items].sort((a, b) => b.price - a.price);
    else if (sort === 'الأحدث') items = [...items].reverse();
    return items;
  }, [products, cat, q, sort]);

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">SHOP</span><h2>كل التوزيعات</h2></div></AnimateScroll>
      </div>

      <div className="shopToolbar">
        <AnimateScroll>
          <div className="searchBar"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPlaceholder} /></div>
        </AnimateScroll>
        <AnimateScroll delay={.05}>
          <div className="shopSort">
            <Filter size={16} />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option>الكل</option>
              <option>الأقل سعراً</option>
              <option>الأعلى سعراً</option>
              <option>الأحدث</option>
            </select>
          </div>
        </AnimateScroll>
      </div>

      <AnimateScroll>
        <div className="filterPills">
          <motion.button className={!cat ? 'pill active' : 'pill'} onClick={() => setCat('')} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>الكل</motion.button>
          {occasions.map(o => (
            <motion.button key={o} className={cat === o ? 'pill active' : 'pill'} onClick={() => setCat(o)} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
              {o}
            </motion.button>
          ))}
        </div>
      </AnimateScroll>

      <p className="productCount">{filtered.length} منتج</p>

      <StaggerContainer className="productGrid">
        {filtered.map(p => (
          <StaggerItem key={p.id}>
            <ProductCard p={p} addToCart={addToCart} wish={wish} setWish={setWish} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {!filtered.length && (
        <AnimateScroll>
          <div className="emptyState">
            <Search size={48} strokeWidth={1} />
            <h3>مفيش نتائج مطابقة</h3>
            <p>جربي كلمة بحث أو مناسبة مختلفة.</p>
          </div>
        </AnimateScroll>
      )}
    </motion.section>
  );
}

function ProductPage({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const { id } = useParams();
  const p = products.find(x => x.id === id) || products[0];
  const [qty, setQty] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const liked = wish.includes(p.id);
  const related = useMemo(() => products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4), [products, p]);

  useEffect(() => { setQty(1); }, [id]);

  return (
    <motion.section className="section page productPage" {...pageVariants}>
      <div className="productPageGrid">
        <AnimateScroll>
          <div className="productGallery">
            <motion.img
              src={p.image}
              alt={p.name}
              className="galleryMain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: .8, ease }}
            />
          </div>
        </AnimateScroll>

        <div className="productInfo">
          <AnimateScroll delay={.1}><span className="eyebrow">{p.category}</span></AnimateScroll>
          <AnimateScroll delay={.15}><h1>{p.name}</h1></AnimateScroll>
          <AnimateScroll delay={.2}><strong className="detailPrice priceGrad">{money(p.price)}</strong></AnimateScroll>
          <AnimateScroll delay={.25}>
            <div className="stockBadge">
              <ShieldCheck size={16} />
              {p.stock > 0 ? `متوفر • ${p.stock} قطعة` : 'نفذ من المخزون'}
            </div>
          </AnimateScroll>
          <AnimateScroll delay={.3}><p className="productLead">{p.desc}</p></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="qtySelector">
              <span>الكمية</span>
              <div className="qtyButtons">
                <motion.button whileTap={{ scale: .85 }} onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></motion.button>
                <span className="qtyValue">{qty}</span>
                <motion.button whileTap={{ scale: .85 }} onClick={() => setQty(Math.min(p.stock, qty + 1))}><Plus size={16} /></motion.button>
              </div>
            </div>
          </AnimateScroll>

          <AnimateScroll delay={.4}>
            <div className="productActions">
              <motion.button
                className="btn primary btnLg"
                whileHover={{ y: -3 }}
                whileTap={{ scale: .96 }}
                onClick={() => { for (let i = 0; i < qty; i++) addToCart(p); }}
                disabled={p.stock === 0}
              >
                <ShoppingBag size={18} /> {t.addToCart}
              </motion.button>
              <motion.button
                className="btn ghost"
                whileHover={{ y: -3 }}
                whileTap={{ scale: .96 }}
                onClick={() => setWish(liked ? wish.filter(x => x !== p.id) : [...wish, p.id])}
              >
                <Heart size={18} fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} />
                {liked ? t.saved : t.save}
              </motion.button>
            </div>
          </AnimateScroll>

          <AnimateScroll delay={.45}>
            <div className="detailsAccordion">
              <motion.button
                className="detailsAccordionBtn"
                onClick={() => setDetailsOpen(!detailsOpen)}
                whileHover={{ x: 4 }}
              >
                {t.productDetails}
                <motion.span animate={{ rotate: detailsOpen ? 180 : 0 }} transition={{ duration: .3 }}>
                  <ChevronDown size={18} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: .3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="detailsContent">
                      <p><b>التخصيص:</b> متاح من خلال استوديو التصميم.</p>
                      <p><b>التغليف:</b> تغليف هدايا أنيق مع شريط ساتان.</p>
                      <p><b>الطلب:</b> الحد الأدنى يختلف حسب التصميم.</p>
                      <p><b>الشحن:</b> مجاني للطلبات فوق 500 ج.م.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimateScroll>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="sectionHead">
            <AnimateScroll><div><span className="eyebrow">RELATED</span><h2>منتجات مشابهة</h2></div></AnimateScroll>
          </div>
          <StaggerContainer className="productGrid">
            {related.map(rp => (
              <StaggerItem key={rp.id}>
                <ProductCard p={rp} addToCart={addToCart} wish={wish} setWish={setWish} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </motion.section>
  );
}

function Choice({ title, values, value, onChange }: { title: string; values: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="choiceGroup">
      <h3>{title}</h3>
      <div className="choiceGrid">
        {values.map(v => (
          <motion.button
            key={v}
            className={v === value ? 'choiceBtn selected' : 'choiceBtn'}
            onClick={() => onChange(v)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: .98 }}
            animate={v === value ? { backgroundColor: 'var(--ink)', color: 'var(--bg)' } : {}}
          >
            {v}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Customizer({ t }: { t: typeof translations.ar }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Design>({ occasion: 'زفاف', type: 'علبة', qty: 30, color: 'آيفوري وذهبي', name: '', date: '', extras: '' });
  const [sent, setSent] = useState(false);
  const steps = ['المناسبة', 'التوزيعة', 'التفاصيل', 'المراجعة'];

  const submit = async () => {
    if (supabase) {
      const { error } = await supabase.from('custom_designs').insert({
        reference: `CD-${Date.now().toString().slice(-7)}`,
        occasion: form.occasion, favor_type: form.type, quantity: form.qty,
        palette: form.color, inscription: form.name, event_date: form.date || null, extras: form.extras
      });
      if (error) { alert(error.message); return; }
    } else {
      localStorage.setItem('em-design', JSON.stringify(form));
    }
    setSent(true);
  };

  return (
    <motion.section className="section page customPage" {...pageVariants}>
      <div className="customHeader">
        <AnimateScroll>
          <span className="eyebrow">BESPOKE STUDIO</span>
          <h2>صممي توزيعتك<br /><em>من الصفر.</em></h2>
          <p>اختاري كل تفصيلة بنفسك، وسنحوّل فكرتك إلى قطعة مصممة لمناسبتك.</p>
        </AnimateScroll>
        <div className="progressBar">
          {steps.map((s, i) => (
            <motion.span
              key={s}
              className={i === step ? 'progressStep active' : i < step ? 'progressStep done' : 'progressStep'}
              animate={i === step ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: .4 }}
            >
              <i>{i < step ? <Check size={12} /> : i + 1}</i>{s}
            </motion.span>
          ))}
          <div className="progressLine">
            <motion.div className="progressFill" animate={{ width: `${(step / (steps.length - 1)) * 100}%` }} transition={{ duration: .4, ease }} />
          </div>
        </div>
      </div>

      <div className="customBody">
        <div className="customPreview">
          <AnimateScale>
            <div className="previewCard">
              <span>ESRAA</span>
              <motion.b key={form.name} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .4 }}>
                {form.name || 'اسم مناسبتك'}
              </motion.b>
              <small>{form.date || 'تاريخ المناسبة'}</small>
              <div className="previewCardMeta">{form.type} • {form.color}</div>
            </div>
          </AnimateScale>
        </div>

        <div className="customForm">
          <span className="stepTitle">الخطوة {step + 1} من 4</span>

          {sent ? (
            <motion.div className="successBlock" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <Check size={48} />
              </motion.div>
              <h3>تم استلام طلب التصميم</h3>
              <p>احتفظي بالتفاصيل، ويمكنك متابعة الطلب بعد إنشاء طلب من صفحة الدفع.</p>
              <Link className="btn primary" to="/shop">استكشفي المنتجات</Link>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: .3, ease }}
                className="stepContent"
              >
                {step === 0 && (
                  <Choice title="اختاري المناسبة" values={occasions} value={form.occasion} onChange={v => setForm({ ...form, occasion: v })} />
                )}
                {step === 1 && (
                  <Choice title="نوع التوزيعة" values={['علبة', 'برطمان', 'كيس فاخر', 'بوكس هدية']} value={form.type} onChange={v => setForm({ ...form, type: v })} />
                )}
                {step === 2 && (
                  <div className="formGrid">
                    <label>الكمية<input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: +e.target.value })} /></label>
                    <label>اللون<select value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}><option>آيفوري وذهبي</option><option>وردي ذهبي</option><option>أبيض وفضي</option><option>كحلي وذهبي</option></select></label>
                    <label className="wide">الاسم المطبوع<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: مريم & أحمد" /></label>
                    <label className="wide">التاريخ<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
                    <label className="wide">ملاحظات إضافية<textarea value={form.extras} onChange={e => setForm({ ...form, extras: e.target.value })} placeholder="أي تفاصيل إضافية…" /></label>
                  </div>
                )}
                {step === 3 && (
                  <div className="summaryReview">
                    <div className="summaryRow"><span>المناسبة</span><b>{form.occasion}</b></div>
                    <div className="summaryRow"><span>التوزيعة</span><b>{form.type}</b></div>
                    <div className="summaryRow"><span>الكمية</span><b>{form.qty} قطعة</b></div>
                    <div className="summaryRow"><span>اللون</span><b>{form.color}</b></div>
                    <div className="summaryRow"><span>الاسم</span><b>{form.name || '---'}</b></div>
                    <div className="summaryRow"><span>التاريخ</span><b>{form.date || '---'}</b></div>
                    {form.extras && <div className="summaryRow"><span>ملاحظات</span><b>{form.extras}</b></div>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!sent && (
            <div className="stepNav">
              {step > 0 && (
                <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setStep(step - 1)}>
                  <ArrowRight size={16} /> السابق
                </motion.button>
              )}
              {step < steps.length - 1 ? (
                <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={() => setStep(step + 1)}>
                  التالي <ArrowLeft size={16} />
                </motion.button>
              ) : (
                <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={submit}>
                  إرسال الطلب <Sparkles size={16} />
                </motion.button>
              )}
            </div>
          )}
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

  // Per business specs, shipping & final price are confirmed after admin review, but we show estimated starting subtotal & request submission
  const estimatedShipping = cartTotal >= 500 ? 0 : 25;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent' ? Math.round(cartTotal * appliedCoupon.discount / 100) : appliedCoupon.discount
    : 0;
  const estimatedTotal = cartTotal - discount + estimatedShipping;

  const defaultCoupons: Coupon[] = [
    { id: 'c1', code: 'MOMENTS10', discount: 10, type: 'percent', maxUsage: 100, usageCount: 12, minOrder: 200, expiry: '2026-12-31', active: true },
    { id: 'c2', code: 'ESRAA2026', discount: 15, type: 'percent', maxUsage: 50, usageCount: 5, minOrder: 300, expiry: '2026-12-31', active: true },
  ];

  const applyCoupon = () => {
    const c = defaultCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (!c) { setCouponError('كوبون غير صالح'); return; }
    if (c.minOrder > cartTotal) { setCouponError(`الحد الأدنى ${money(c.minOrder)}`); return; }
    setAppliedCoupon(c);
    setCouponError('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
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
        subtotal: cartTotal, shipping_fee: estimatedShipping, total: estimatedTotal,
        status: 'قيد المراجعة', payment_status: 'بانتظار تأكيد السعر والشحن'
      }).select().single();
      if (error) { alert(error.message); return; }
      await supabase.from('order_items').insert(cart.map(i => ({
        order_id: data.id, product_id: i.id, name: i.name,
        unit_price: i.price, quantity: i.qty, total: i.price * i.qty
      })));
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
      <h1>تم استلام طلبك بنجاح</h1>
      <p className="orderNumber">رقم الطلب: <b>{done}</b></p>
      <p>سيقوم فريق إسراء مومنتس بمراجعة تفاصيل التخصيص والكمية وتأكيد السعر النهائي ومصاريف الشحن معك قريباً.</p>
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }}>
        <Link className="btn primary" to={`/track?order=${done}`}><MapPin size={18} /> تتبع الطلب والدفع</Link>
      </motion.div>
    </motion.section>
  );

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER REQUEST</span><h2>إرسال طلب التوزيعات</h2></div></AnimateScroll>
      </div>
      <form className="checkoutGrid" onSubmit={submit}>
        <div className="checkoutFields">
          <AnimateScroll><label><span className="labelIcon"><Phone size={14} /></span> الاسم الكامل<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.05}><label><span className="labelIcon"><Phone size={14} /></span> رقم الهاتف<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></label></AnimateScroll>
          <AnimateScroll delay={.1}><label><span className="labelIcon"><Mail size={14} /></span> البريد الإلكتروني<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.15}><label><span className="labelIcon"><MapPin size={14} /></span> المدينة<select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}><option>القاهرة</option><option>الإسكندرية</option><option>الجيزة</option><option>المنصورة</option><option>أخرى</option></select></label></AnimateScroll>
          <AnimateScroll delay={.2}><label className="wide"><span className="labelIcon"><MapPin size={14} /></span> العنوان بالتفصيل للشحن<textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.25}><label><span className="labelIcon"><Gift size={14} /></span> المناسبة<select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>{occasions.map(o => <option key={o}>{o}</option>)}</select></label></AnimateScroll>
          <AnimateScroll delay={.3}><label className="wide"><span className="labelIcon"><Edit3 size={14} /></span> ملاحظات التخصيص أو الأسماء المطلوب طباعتها<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="مثال: الأسماء المطلوب طباعتها، الألوان، أو أي تعليمات خاصة…" /></label></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="paymentSection">
              <p className="paymentTitle"><CreditCard size={16} /> طريقة الدفع المفضلة (تتم بعد تأكيد السعر والشحن)</p>
              {([
                { key: 'instapay', label: 'إنستاباي / محفظة إلكترونية', icon: <DollarSign size={16} /> },
                { key: 'cod', label: 'الدفع عند الاستلام', icon: <Truck size={16} /> },
                { key: 'card', label: 'بطاقة ائتمانية', icon: <CreditCard size={16} /> }
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
                <span>{i.name} × {i.qty}</span>
                <b>{money(i.price * i.qty)}</b>
              </div>
            ))}
            <hr />
            <div className="summaryItem"><span>{t.subtotal}</span><b>{money(cartTotal)}</b></div>
            <div className="summaryItem"><span>{t.shipping} (تقديري)</span><b className={estimatedShipping === 0 ? 'freeShipping' : ''}>{estimatedShipping ? money(estimatedShipping) : t.free}</b></div>

            <div className="couponSection">
              <div className="couponInput">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="كود الخصم" />
                <motion.button type="button" className="btn primary" whileTap={{ scale: .95 }} onClick={applyCoupon}>تطبيق</motion.button>
              </div>
              {couponError && <p className="couponError">{couponError}</p>}
              {appliedCoupon && (
                <p className="couponApplied">
                  <Check size={14} /> كوبون {appliedCoupon.code} — خصم {appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}%` : money(appliedCoupon.discount)}
                </p>
              )}
            </div>

            {discount > 0 && <div className="summaryItem discount"><span>الخصم</span><b>-{money(discount)}</b></div>}
            <hr />
            <div className="summaryGrand"><span>الإجمالي (تقديري)</span><b>{money(estimatedTotal)}</b></div>
            <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>* السعر النهائي ومصاريف الشحن يتم تأكيدها من قِبل الإدارة بعد مراجعة تفاصيل التخصيص والكمية.</p>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }} style={{ marginTop: 16 }}>
              <button className="btn primary full btnLg" type="submit" disabled={!cart.length}>
                <Send size={18} /> إرسال طلب التوزيعات
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

  const statusList = ['قيد المراجعة', 'تم تأكيد السعر', 'بانتظار الدفع', 'تم رفع إيصال الدفع', 'تم التحقق والإنتاج', 'تم الشحن', 'مكتمل'];
  const statusIdx = statusList.indexOf(order?.status || order?.payment_status || 'قيد المراجعة');

  const search = async () => {
    if (!input.trim()) return;
    if (supabase) {
      const { data } = await supabase.from('orders').select('*').eq('order_number', input.trim()).maybeSingle();
      setOrder(data); setFound(!!data);
    } else {
      const allOrders = getLocal<any[]>('em-all-orders', []);
      const foundOrd = allOrders.find(o => o.order_number === input.trim() || o.orderNo === input.trim());
      const lastOrd = getLocal<any | null>('em-last-order', null);
      const match = foundOrd || (lastOrd?.orderNo === input.trim() ? lastOrd : null);
      if (match) { setOrder(match); setFound(true); }
      else { setOrder(null); setFound(false); }
    }
  };

  useEffect(() => { if (q) { setInput(q); setTimeout(search, 300); } }, [q]);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file.name);
      setProofSubmitted(true);
      if (order) {
        const updated = { ...order, status: 'تم رفع إيصال الدفع', payment_status: 'تم رفع إيصال الدفع (قيد التحقق)' };
        setOrder(updated);
        localStorage.setItem('em-last-order', JSON.stringify(updated));
        const allOrders = getLocal<any[]>('em-all-orders', []).map(o => (o.order_number === order.order_number || o.orderNo === order.orderNo) ? updated : o);
        localStorage.setItem('em-all-orders', JSON.stringify(allOrders));
      }
    }
  };

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER TRACKING & PAYMENT</span><h2>تتبعي طلبك والدفع</h2></div></AnimateScroll>
      </div>
      <div className="trackingPage">
        <AnimateScroll>
          <div className="trackingSearch">
            <Search size={18} />
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="أدخلي رقم الطلب (EM-XXXXXXXX)" onKeyDown={e => e.key === 'Enter' && search()} />
            <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .95 }} onClick={search}>بحث</motion.button>
          </div>
        </AnimateScroll>

        {order ? (
          <AnimateScroll>
            <div className="trackingCard">
              <div className="trackingCardHead">
                <Package size={24} />
                <div>
                  <h3>{order.order_number || order.orderNo}</h3>
                  <p>العميل: <b>{order.customer_name || '---'}</b></p>
                </div>
              </div>
              <div className="trackingMeta">
                <div><span>حالة الطلب</span><b>{order.status || 'قيد المراجعة'}</b></div>
                <div><span>حالة الدفع</span><b className="priceGrad">{order.payment_status || 'بانتظار تأكيد السعر والشحن'}</b></div>
                <div><span>المبلغ الإجمالي النهائي</span><b className="priceGrad">{money(Number(order.total || 0))}</b></div>
                <div><span>مصاريف الشحن المؤكدة</span><b>{money(Number(order.shipping_fee || 25))}</b></div>
                <div><span>العنوان</span><b>{order.city || '---'} - {order.address || '---'}</b></div>
              </div>

              {/* Payment instructions & proof upload */}
              <div className="paymentWorkflowBox" style={{ marginTop: 24, padding: 20, background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4><CreditCard size={18} /> تعليمات الدفع والتحويل</h4>
                <p style={{ marginTop: 8, fontSize: 14 }}>يرجى التحويل عبر InstaPay أو محفظة فودافون كاش إلى الرقم: <b>01000000000</b> بالمبلغ الإجمالي النهائي ({money(Number(order.total || 0))}).</p>
                <p style={{ marginTop: 4, fontSize: 13, color: 'var(--muted)' }}>بعد التحويل، قومي برفع صورة إيصال التحويل أدناه ليقوم فريق الإدارة بالتحقق واعتماد الطلب فوراً.</p>
                
                <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label className="btn primary" style={{ cursor: 'pointer' }}>
                    <Upload size={16} /> رفع إيصال الدفع
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleProofUpload} />
                  </label>
                  {(proofFile || proofSubmitted || order.payment_status?.includes('تم رفع')) && (
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <Check size={16} /> تم رفع الإيصال بنجاح ({proofFile || 'إيصال التحويل'}) — قيد التحقق من الإدارة
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
              <h3>لم يتم العثور على طلب</h3>
              <p>جربي رقم طلب مختلف.</p>
            </div>
          </AnimateScroll>
        ) : (
          <AnimateScroll>
            <div className="emptyState">
              <MapPin size={48} strokeWidth={1} />
              <h3>أدخلي رقم الطلب</h3>
              <p>لعرض تفاصيل السعر، الشحن، وحالة الدفع.</p>
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
    if (!supabase) { localStorage.setItem('em-admin-demo', '1'); nav('/admin'); return; }
    const r = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (r.error) setError(r.error.message); else nav('/admin');
  };

  return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LogIn size={28} />
          </motion.div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}</h1>
          <form onSubmit={submit}>
            <label>
              <span className="labelIcon"><Mail size={14} /></span>
              البريد الإلكتروني
              <input type="email" required placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
              <span className="labelIcon"><Lock size={14} /></span>
              كلمة المرور
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <motion.button className="btn primary full btnLg" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
              <LogIn size={18} /> {mode === 'login' ? 'دخول' : 'إنشاء حساب'}
            </motion.button>
          </form>
          {error && <p className="authError">{error}</p>}
          <motion.button
            className="textButton"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: .98 }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'ليس لديك حساب؟ أنشئي حسابًا' : 'لديك حساب؟ سجلي الدخول'}
          </motion.button>
        </div>
      </AnimateScale>
    </motion.section>
  );
}

function AdminPage({ t }: { t: typeof translations.ar }) {
  const [tab, setTab] = useState('dashboard');
  const [logged, setLogged] = useState(localStorage.getItem('em-admin-demo') === '1');
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
    whatsapp: '201xxxxxxxxx', email: 'info@esraamoments.com', phone: '01000000000',
    instagram: 'https://instagram.com/esraamomentsstore', tiktok: 'https://tiktok.com/@esraamomentsstore'
  });

  useEffect(() => {
    (async () => {
      if (supabase) {
        const a = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
        if (a.data) setOrders(a.data as Order[]);
        const b = await supabase.from('products').select('id,name,price,stock,is_active,image_url,description,categories(name)');
        if (b.data) setProducts(b.data.map((x: any) => ({
          id: x.id, name: x.name, category: x.categories?.name || '', price: Number(x.price),
          stock: x.stock, image: x.image_url || seed[0].image, desc: x.description || ''
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
  }, []);

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

  if (!logged) return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LayoutDashboard size={28} />
          </motion.div>
          <span className="eyebrow">ADMIN</span>
          <h1>لوحة التحكم</h1>
          <p>هذه المنطقة محمية. سجلي الدخول بحساب الإدارة.</p>
          <Link className="btn primary full btnLg" to="/login"><LogIn size={18} /> تسجيل الدخول</Link>
        </div>
      </AnimateScale>
    </motion.section>
  );

  const tabs: [string, string, any][] = [
    ['dashboard', 'نظرة عامة', LayoutDashboard],
    ['products', 'المنتجات', Box],
    ['orders', 'الطلبات والأسعار', Package],
    ['customers', 'العملاء', Users],
    ['coupons', 'الكوبونات', Tag],
    ['settings', 'الإعدادات', Settings],
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
            whileHover={{ x: -5 }}
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
          <LogOut size={18} /> خروج
        </button>
      </aside>

      <main className="adminMain">
        <div className="adminTop">
          <div>
            <span className="eyebrow">ESRAA MOMENTS</span>
            <h1>{tabs.find(t => t[0] === tab)?.[1]}</h1>
          </div>
          <Link className="btn ghost" to="/"><Store size={16} /> عرض المتجر</Link>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: .3 }}>
            {tab === 'dashboard' && <DashboardPanel orders={orders} products={products} />}
            {tab === 'products' && <ProductsAdmin products={products} setProducts={setProducts} />}
            {tab === 'orders' && <OrdersAdmin orders={orders} setOrders={setOrders} />}
            {tab === 'customers' && <CustomersAdmin customers={customers} orders={orders} />}
            {tab === 'coupons' && <CouponsAdmin coupons={coupons} setCoupons={setCoupons} />}
            {tab === 'settings' && <SettingsAdmin settings={settings} setSettings={setSettings} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardPanel({ orders, products }: { orders: Order[]; products: Product[] }) {
  const totalSales = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const lowStock = products.filter(p => p.stock < 20);
  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <StaggerContainer className="statsGrid">
        {([
          { label: 'المبيعات', value: money(totalSales), Icon: TrendingUp, sub: 'إجمالي المبيعات المؤكدة' },
          { label: 'الطلبات', value: orders.length.toString(), Icon: Package, sub: 'طلبات العملاء' },
          { label: 'المنتجات', value: products.length.toString(), Icon: Box, sub: 'في الكتالوج' },
          { label: 'العملاء', value: new Set(orders.map(o => o.customer_name)).size.toString(), Icon: Users, sub: 'عملاء فريدون' },
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
            <h3><Clock size={18} /> آخر الطلبات وتأكيد الأسعار</h3>
            <span className="muted">{orders.length} طلب</span>
          </div>
          <div className="adminTable">
            <div className="adminTableRow header">
              <span>رقم الطلب</span><span>العميل</span><span>الإجمالي</span><span>حالة الدفع</span><span>التاريخ</span>
            </div>
            {recentOrders.map(o => (
              <motion.div className="adminTableRow" key={o.id || o.order_number} whileHover={{ backgroundColor: 'var(--paper)' }}>
                <span><b>{o.order_number || o.orderNo}</b></span>
                <span>{o.customer_name}</span>
                <span>{money(Number(o.total || 0))}</span>
                <span><span className="badge badgeWarning">{o.payment_status || o.status || 'قيد المراجعة'}</span></span>
                <small>{o.created_at ? new Date(o.created_at).toLocaleDateString('ar-EG') : '---'}</small>
              </motion.div>
            ))}
            {!recentOrders.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>لا توجد طلبات بعد.</span></div>}
          </div>
        </div>

        <div className="adminPanel">
          <div className="panelHead"><h3><AlertTriangle size={18} /> تنبيه المخزون</h3></div>
          {lowStock.length > 0 ? lowStock.map(p => (
            <motion.div className="stockAlert" key={p.id} whileHover={{ x: 4 }}>
              <div className="stockAlertInfo"><Box size={14} /><span>{p.name}</span></div>
              <div className="stockAlertBar"><i style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} /></div>
              <small>{p.stock} قطعة</small>
            </motion.div>
          )) : <p className="muted">جميع المنتجات متوفرة.</p>}

          <div className="panelHead" style={{ marginTop: 20 }}><h3><Sparkles size={18} /> إجراءات سريعة</h3></div>
          <div className="quickActions">
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}><Plus size={16} /> إضافة منتج</motion.button>
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}><Download size={16} /> تصدير</motion.button>
            <motion.button className="btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}><Tag size={16} /> كوبون</motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductsAdmin({ products, setProducts }: { products: Product[]; setProducts: (p: Product[] | ((prev: Product[]) => Product[])) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'سبوع', price: '', stock: '', image: '', desc: '', featured: false });

  const resetForm = () => { setForm({ name: '', category: 'سبوع', price: '', stock: '', image: '', desc: '', featured: false }); setEditId(null); setShowForm(false); };
  const startEdit = (p: Product) => { setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), image: p.image, desc: p.desc, featured: !!p.featured }); setEditId(p.id); setShowForm(true); };

  const saveProduct = () => {
    if (!form.name || !form.price) return;
    if (editId) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image, desc: form.desc, featured: form.featured } : p));
    } else {
      setProducts(prev => [...prev, { id: `p${Date.now()}`, name: form.name, category: form.category, price: Number(form.price), stock: Number(form.stock), image: form.image || seed[0].image, desc: form.desc, featured: form.featured }]);
    }
    resetForm();
  };

  const deleteProduct = (id: string) => { setProducts(prev => prev.filter(p => p.id !== id)); };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Box size={18} /> إدارة المنتجات</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X size={16} /> : <><Plus size={16} /> إضافة منتج</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="adminForm" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
            <div className="formGrid">
              <label>اسم المنتج<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
              <label>القسم / المناسبة<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{occasions.map(o => <option key={o}>{o}</option>)}</select></label>
              <label><DollarSign size={14} /> السعر (ج.م)<input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
              <label><Package size={14} /> المخزون<input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label>
              <label className="wide"><ImageIcon size={14} /> رابط الصورة<input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="/images/..." /></label>
              <label className="wide"><Edit3 size={14} /> الوصف<textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></label>
              <label className="wide checkboxLabel"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> <Star size={14} /> منتج مميز</label>
            </div>
            <div className="formActions">
              <motion.button className="btn primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={saveProduct}><Check size={16} /> {editId ? 'تحديث' : 'إضافة'}</motion.button>
              <motion.button className="btn ghost" whileTap={{ scale: .97 }} onClick={resetForm}>إلغاء</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>الصورة</span><span>المنتج</span><span>القسم</span><span>السعر</span><span>المخزون</span><span>إجراءات</span>
        </div>
        <AnimatePresence>
          {products.map(p => (
            <motion.div className="adminTableRow" key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} whileHover={{ backgroundColor: 'var(--paper)' }}>
              <span><img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} /></span>
              <span><b>{p.name}</b><small className="muted">{p.desc.slice(0, 40)}...</small></span>
              <span>{p.category}</span>
              <span>{money(p.price)}</span>
              <span>{p.stock} قطعة</span>
              <span className="tableActions">
                <button className="icon" onClick={() => startEdit(p)} title="تعديل"><Edit3 size={16} /></button>
                <button className="icon" onClick={() => deleteProduct(p.id)} title="حذف" style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrdersAdmin({ orders, setOrders }: { orders: Order[]; setOrders: (o: Order[]) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editShipping, setEditShipping] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');

  const updateOrderPricing = (o: Order) => {
    const newTotal = Number(editPrice || o.subtotal) + Number(editShipping || o.shipping_fee);
    const updated = {
      ...o,
      subtotal: Number(editPrice || o.subtotal),
      shipping_fee: Number(editShipping || o.shipping_fee),
      total: newTotal,
      status: 'تم تأكيد السعر',
      payment_status: editPaymentStatus || 'بانتظار الدفع'
    };
    const newOrders = orders.map(x => (x.id === o.id || x.order_number === o.order_number) ? updated : x);
    setOrders(newOrders);
    localStorage.setItem('em-all-orders', JSON.stringify(newOrders));
    setSelectedOrder(null);
    alert('تم تحديث السعر ومصاريف الشحن بنجاح!');
  };

  const verifyPayment = (o: Order) => {
    const updated = { ...o, status: 'تم التحقق والإنتاج', payment_status: 'تم التحقق (مدفوع)' };
    const newOrders = orders.map(x => (x.id === o.id || x.order_number === o.order_number) ? updated : x);
    setOrders(newOrders);
    localStorage.setItem('em-all-orders', JSON.stringify(newOrders));
    setSelectedOrder(updated);
    alert('تم التحقق من الدفع واعتماد الطلب للإنتاج!');
  };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Package size={18} /> مراجعة الطلبات وتأكيد الأسعار والشحن</h3>
        <span className="muted">{orders.length} طلب</span>
      </div>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>رقم الطلب</span><span>العميل</span><span>المناسبة</span><span>المبلغ الإجمالي</span><span>حالة الدفع</span><span>الإجراء</span>
        </div>
        {orders.map(o => (
          <motion.div className="adminTableRow" key={o.id || o.order_number} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{o.order_number || o.orderNo}</b></span>
            <span>{o.customer_name}<br /><small className="muted">{o.customer_phone}</small></span>
            <span>{o.occasion}</span>
            <span><b>{money(Number(o.total || 0))}</b></span>
            <span><span className="badge badgeWarning">{o.payment_status || o.status || 'قيد المراجعة'}</span></span>
            <span>
              <motion.button className="btn btn-sm primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { setSelectedOrder(o); setEditPrice(String(o.subtotal || 0)); setEditShipping(String(o.shipping_fee || 25)); setEditPaymentStatus(o.payment_status || 'بانتظار الدفع'); }}>
                مراجعة وتأكيد <Eye size={14} />
              </motion.button>
            </span>
          </motion.div>
        ))}
        {!orders.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>لا توجد طلبات حتى الآن.</span></div>}
      </div>

      {selectedOrder && (
        <div className="modalOverlay" onClick={() => setSelectedOrder(null)}>
          <div className="modalCard" onClick={e => e.stopPropagation()}>
            <div className="modalHead">
              <h3>مراجعة تفاصيل الطلب: {selectedOrder.order_number || selectedOrder.orderNo}</h3>
              <button className="icon" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modalBody" style={{ display: 'grid', gap: 16 }}>
              <p><b>العميل:</b> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p><b>العنوان:</b> {selectedOrder.city} - {selectedOrder.address}</p>
              <p><b>المناسبة:</b> {selectedOrder.occasion}</p>
              <p><b>ملاحظات التخصيص:</b> {selectedOrder.notes || '---'}</p>

              <hr />
              <h4>تحديد السعر النهائي ومصاريف الشحن</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>سعر المنتجات النهائي (ج.م)
                  <input type="number" className="input" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                </label>
                <label>مصاريف الشحن (ج.م)
                  <input type="number" className="input" value={editShipping} onChange={e => setEditShipping(e.target.value)} />
                </label>
              </div>
              <label>حالة الدفع
                <select className="select" value={editPaymentStatus} onChange={e => setEditPaymentStatus(e.target.value)}>
                  <option>بانتظار تأكيد السعر والشحن</option>
                  <option>بانتظار الدفع</option>
                  <option>تم رفع إيصال الدفع (قيد التحقق)</option>
                  <option>تم التحقق (مدفوع)</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <motion.button className="btn primary" whileTap={{ scale: .96 }} onClick={() => updateOrderPricing(selectedOrder)}>
                  حفظ وتأكيد السعر والشحن للعميل
                </motion.button>
                {selectedOrder.payment_status?.includes('تم رفع') && (
                  <motion.button className="btn" style={{ background: 'var(--success)', color: '#fff' }} whileTap={{ scale: .96 }} onClick={() => verifyPayment(selectedOrder)}>
                    <Check size={16} /> التحقق من إيصال الدفع واعتماد الطلب
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

function CustomersAdmin({ customers, orders }: { customers: Customer[]; orders: Order[] }) {
  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Users size={18} /> إدارة العملاء</h3>
        <span className="muted">{customers.length} عميل</span>
      </div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>اسم العميل</span><span>الهاتف</span><span>البريد</span><span>عدد الطلبات</span><span>إجمالي الإنفاق</span>
        </div>
        {customers.map((c, i) => (
          <motion.div className="adminTableRow" key={i} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.name}</b></span>
            <span dir="ltr">{c.phone || '---'}</span>
            <span>{c.email || '---'}</span>
            <span>{c.ordersCount} طلب</span>
            <span className="priceGrad"><b>{money(c.totalSpent)}</b></span>
          </motion.div>
        ))}
        {!customers.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>لا يوجد عملاء بعد.</span></div>}
      </div>
    </div>
  );
}

function CouponsAdmin({ coupons, setCoupons }: { coupons: Coupon[]; setCoupons: (c: Coupon[]) => void }) {
  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Tag size={18} /> إدارة الكوبونات والعروض</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
          <Plus size={16} /> إضافة كوبون
        </motion.button>
      </div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>الكود</span><span>الخصم</span><span>الحد الأدنى</span><span>الاستخدام</span><span>الحالة</span>
        </div>
        {coupons.map(c => (
          <motion.div className="adminTableRow" key={c.id} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.code}</b></span>
            <span>{c.type === 'percent' ? `${c.discount}%` : money(c.discount)}</span>
            <span>{money(c.minOrder)}</span>
            <span>{c.usageCount} / {c.maxUsage}</span>
            <span><span className="badge badgeSuccess">نشط</span></span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsAdmin({ settings, setSettings }: { settings: any; setSettings: any }) {
  return (
    <div className="adminPanel">
      <div className="panelHead"><h3><Settings size={18} /> إعدادات المتجر والمنصة</h3></div>
      <div className="formGrid" style={{ marginTop: 20 }}>
        <label>اسم المتجر<input className="input" value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} /></label>
        <label>رقم هاتف الدفع (InstaPay / Wallet)<input className="input" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} /></label>
        <label>رسوم الشحن الافتراضية (ج.م)<input className="input" value={settings.shippingFee} onChange={e => setSettings({ ...settings, shippingFee: e.target.value })} /></label>
        <label>حد الشحن المجاني (ج.م)<input className="input" value={settings.freeShippingThreshold} onChange={e => setSettings({ ...settings, freeShippingThreshold: e.target.value })} /></label>
        <label className="wide">وصف المتجر<textarea className="textarea" value={settings.storeDesc} onChange={e => setSettings({ ...settings, storeDesc: e.target.value })} /></label>
      </div>
      <motion.button className="btn primary" style={{ marginTop: 24 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={() => alert('تم حفظ الإعدادات بنجاح!')}>
        حفظ الإعدادات
      </motion.button>
    </div>
  );
}

function Footer({ t }: { t: typeof translations.ar }) {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div className="footerCol">
          <Link to="/" className="brand footerBrand">
            <span className="brandMark"><img src="/images/logo.jpeg" alt="Esraa Moments" /></span>
            <span className="brandText"><b>ESRAA</b><small>Moments</small></span>
          </Link>
          <p className="footerDesc">تفاصيل صغيرة تصنع لحظات لا تُنسى. توزيعات وهدايا مخصصة لكل مناسباتك السعيدة في مصر.</p>
          <div className="socialLinks">
            <motion.a href="https://instagram.com" target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="Instagram">
              <Instagram size={20} />
            </motion.a>
            <motion.a href="https://whatsapp.com" target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="WhatsApp">
              <MessageCircle size={20} />
            </motion.a>
          </div>
        </div>

        <div className="footerCol">
          <h4>{t.store}</h4>
          <ul>
            {occasions.slice(0, 6).map(o => (
              <li key={o}><Link to={`/shop?cat=${encodeURIComponent(o)}`}>{o}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footerCol">
          <h4>روابط سريعة</h4>
          <ul>
            <li><Link to="/custom">{t.designStudio}</Link></li>
            <li><Link to="/track">{t.track}</Link></li>
            <li><a href="/#about">{t.aboutUs}</a></li>
            <li><a href="/#faq">{t.faq}</a></li>
          </ul>
        </div>

        <div className="footerCol">
          <h4>التواصل</h4>
          <p className="footerContactItem"><MapPin size={16} /> القاهرة، مصر</p>
          <p className="footerContactItem"><Phone size={16} /> 01000000000</p>
          <p className="footerContactItem"><Mail size={16} /> info@esraamoments.com</p>
        </div>
      </div>
      <div className="footerBottom">
        <div className="container flex-between">
          <p>© {new Date().getFullYear()} ESRAA Moments. جميع الحقوق محفوظة.</p>
          <p className="craftedBy">Luxury Custom Event Favors Platform</p>
        </div>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);
