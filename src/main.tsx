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
  AlertTriangle, ChevronRight, ChevronLeft, Image as ImageIcon, RotateCw
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { supabase } from './lib/supabase';
import './styles.css';

type Product = { id: string; name: string; category: string; price: number; stock: number; image: string; desc: string; featured?: boolean };
type CartItem = Product & { qty: number };
type Design = { occasion: string; type: string; qty: number; color: string; name: string; date: string; extras: string };
type Coupon = { id: string; code: string; discount: number; type: 'percent' | 'fixed'; maxUsage: number; usageCount: number; minOrder: number; expiry: string; active: boolean };
type Order = { id: string; order_number: string; customer_name: string; customer_phone: string; customer_email: string; city: string; address: string; occasion: string; notes: string; payment_method: string; subtotal: number; shipping_fee: number; total: number; status: string; created_at: string };
type Customer = { name: string; email: string; phone: string; ordersCount: number; totalSpent: number };

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
];

const occasions = ['سبوع', 'خطوبة', 'حنة', 'كتب كتاب', 'زفاف'];
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
  const [menu, setMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('em-dark', dark ? '1' : '0');
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [location.pathname]);
  useEffect(() => {
    const handler = () => setCartOpen(false);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

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

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        menu={menu}
        setMenu={setMenu}
        dark={dark}
        setDark={setDark}
        onCartClick={() => setCartOpen(true)}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        changeQty={changeQty}
        remove={removeFromCart}
        total={cartTotal}
      />

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/" element={<Home products={products} addToCart={addToCart} wish={wish} setWish={setWish} />} />
            <Route path="/shop" element={<ShopPage products={products} addToCart={addToCart} wish={wish} setWish={setWish} />} />
            <Route path="/product/:id" element={<ProductPage products={products} addToCart={addToCart} wish={wish} setWish={setWish} />} />
            <Route path="/custom" element={<Customizer />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} cartTotal={cartTotal} />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function Header({
  cartCount, menu, setMenu, dark, setDark, onCartClick
}: {
  cartCount: number; menu: boolean; setMenu: (v: boolean) => void;
  dark: boolean; setDark: (v: boolean) => void; onCartClick: () => void;
}) {
  const scrolled = useScrollShadow();
  return (
    <motion.header
      className={`header ${scrolled ? 'headerScrolled' : ''}`}
      initial={{ y: -82 }}
      animate={{ y: 0 }}
      transition={{ duration: .6, ease }}
    >
      <button className="icon mobileOnly" onClick={() => setMenu(!menu)}>
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
        <Link to="/shop" onClick={() => setMenu(false)}>المتجر</Link>
        <Link to="/custom" onClick={() => setMenu(false)}>صممي</Link>
        <a href="/#about" onClick={() => setMenu(false)}>من نحن</a>
        <a href="/#faq" onClick={() => setMenu(false)}>الأسئلة</a>
        <Link to="/track" onClick={() => setMenu(false)}>تتبعي</Link>
      </nav>

      <div className="headerActions">
        <motion.button
          className="icon"
          onClick={() => setDark(!dark)}
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: .9 }}
          transition={{ duration: .4 }}
          aria-label="تبديل الوضع"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        <motion.button className="icon cartTrigger" onClick={onCartClick} whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }}>
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
  open, onClose, cart, changeQty, remove, total
}: {
  open: boolean; onClose: () => void; cart: CartItem[];
  changeQty: (id: string, d: number) => void; remove: (id: string) => void;
  total: number;
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
              <h2><ShoppingBag size={20} /> سلة الطلب</h2>
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
                  تصفحي المتجر
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
                    <div><span>المنتجات</span><b>{money(total)}</b></div>
                    <div><span>الشحن</span><b className={shipping === 0 ? 'freeShipping' : ''}>{shipping ? money(shipping) : 'مجاني'}</b></div>
                    {total < 500 && total > 0 && <p className="shippingHint">شحن مجاني للطلبات فوق 500 ج.م</p>}
                    <hr />
                    <div className="cartDrawerGrand"><span>الإجمالي</span><b>{money(total + shipping)}</b></div>
                  </div>
                  <motion.button
                    className="btn primary full"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: .97 }}
                    onClick={() => { onClose(); nav('/checkout'); }}
                  >
                    إتمام الطلب <ArrowLeft size={18} />
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
          aria-label="أضيفي للمفضلة"
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

function Home({ products, addToCart, wish, setWish }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void }) {
  const faqData = [
    { q: 'كم يستغرق تجهيز الطلب؟', a: 'عادة من 3 إلى 5 أيام عمل، ثم الشحن خلال 24-48 ساعة. الطلبات الكبيرة قد تحتاج وقتاً إضافياً.' },
    { q: 'ما الحد الأدنى للطلب؟', a: 'الحد الأدنى 15 قطعة للتوزيعات المخصصة. للمنتجات الجاهزة لا يوجد حد أدنى.' },
    { q: 'هل يمكن معاينة العينة؟', a: 'نعم، نرسل صور وفيديو للعينة الأولى قبل البدء بالكمية لضمان رضاكِ التام.' },
    { q: 'ما طرق الدفع المتاحة؟', a: 'البطاقات الائتمانية، فودافون كاش، إنستاباي، والدفع عند الاستلام.' },
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
            HANDCRAFTED • PERSONALIZED • TIMELESS
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
              <Link className="btn primary btnLg" to="/shop">اكتشفي التوزيعات <ArrowLeft size={18} /></Link>
            </motion.div>
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: .96 }}>
              <Link className="btn ghost btnLg" to="/custom">صممي توزيعتك <Sparkles size={18} /></Link>
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
            <div><span className="eyebrow">YOUR OCCASION</span><h2>اختاري مناسبتك</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <p>لكل لحظة طابعها الخاص، ولكل طابع تفاصيله.</p>
          </AnimateScroll>
        </div>
        <StaggerContainer className="occasionGrid">
          {occasions.map((o, i) => (
            <StaggerItem key={o}>
              <motion.div whileHover={{ x: -12, backgroundColor: 'var(--paper)' }} transition={{ duration: .3, ease }}>
                <Link to={`/shop?cat=${encodeURIComponent(o)}`} className="occasionCard">
                  <span className="occasionNum">0{i + 1}</span>
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
            <div><span className="eyebrow">CURATED COLLECTION</span><h2>اختياراتنا المميزة</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <Link className="textLink" to="/shop">شاهدي المجموعة كاملة <ArrowLeft size={16} /></Link>
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
            <div><span className="eyebrow">BEST SELLERS</span><h2>الأكثر مبيعاً</h2></div>
          </AnimateScroll>
          <AnimateScroll delay={.1}>
            <Link className="textLink" to="/shop">شاهدي الكل <ArrowLeft size={16} /></Link>
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
            <h2>ابقي على تواصل</h2>
            <p>سجّلي للحصول على أحدث التصاميم والعروض الحصرية مباشرة في بريدك.</p>
            <div className="newsletterForm">
              <input type="email" placeholder="بريدك الإلكتروني" />
              <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
                <Send size={16} /> اشتركي
              </motion.button>
            </div>
          </div>
        </AnimateScroll>
      </section>

      <section className="section faq" id="faq">
        <AnimateScroll>
          <div className="sectionHead center">
            <div><span className="eyebrow">FAQ</span><h2>الأسئلة الشائعة</h2></div>
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
        <span className="eyebrow">LET'S CREATE</span>
        <h2>-transforming moments into memories-</h2>
        <motion.div whileHover={{ y: -4, boxShadow: '0 15px 40px rgba(0,0,0,.25)' }} whileTap={{ scale: .96 }}>
          <Link className="btn light btnLg" to="/custom">ابدئي رحلتك <Sparkles size={18} /></Link>
        </motion.div>
      </motion.section>
    </>
  );
}

function ShopPage({ products, addToCart, wish, setWish }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void }) {
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
          <div className="searchBar"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحثي عن توزيعة…" /></div>
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

function ProductPage({ products, addToCart, wish, setWish }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void }) {
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
                <ShoppingBag size={18} /> أضيفي للسلة
              </motion.button>
              <motion.button
                className="btn ghost"
                whileHover={{ y: -3 }}
                whileTap={{ scale: .96 }}
                onClick={() => setWish(liked ? wish.filter(x => x !== p.id) : [...wish, p.id])}
              >
                <Heart size={18} fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} />
                {liked ? 'محفوظة' : 'حفظ'}
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
                تفاصيل المنتج
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

function Customizer() {
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
function CheckoutPage({ cart, setCart, cartTotal }: { cart: CartItem[]; setCart: SetCart; cartTotal: number }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: 'القاهرة', address: '', occasion: 'سبوع', notes: '', payment: 'cod' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const shipping = cartTotal >= 500 ? 0 : 25;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent' ? Math.round(cartTotal * appliedCoupon.discount / 100) : appliedCoupon.discount
    : 0;
  const finalTotal = cartTotal - discount + shipping;

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
    if (supabase) {
      const { data, error } = await supabase.from('orders').insert({
        order_number: orderNo, customer_name: form.name, customer_phone: form.phone,
        customer_email: form.email, city: form.city, address: form.address,
        occasion: form.occasion, notes: form.notes, payment_method: form.payment,
        subtotal: cartTotal, shipping_fee: shipping, total: finalTotal
      }).select().single();
      if (error) { alert(error.message); return; }
      await supabase.from('order_items').insert(cart.map(i => ({
        order_id: data.id, product_id: i.id, name: i.name,
        unit_price: i.price, quantity: i.qty, total: i.price * i.qty
      })));
    } else {
      localStorage.setItem('em-last-order', JSON.stringify({
        orderNo, ...form, total: finalTotal, items: cart, status: 'قيد المراجعة',
        created_at: new Date().toISOString()
      }));
    }
    setCart([]);
    setDone(orderNo);
  };

  if (done) return (
    <motion.section className="section page successPage" {...pageVariants}>
      <motion.div className="successIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <Check size={48} />
      </motion.div>
      <h1>تم استلام طلبك</h1>
      <p className="orderNumber">رقم الطلب: <b>{done}</b></p>
      <p>احتفظي بالرقم لمتابعة حالة الطلب.</p>
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }}>
        <Link className="btn primary" to={`/track?order=${done}`}><MapPin size={18} /> تتبع الطلب</Link>
      </motion.div>
    </motion.section>
  );

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">CHECKOUT</span><h2>إتمام الطلب</h2></div></AnimateScroll>
      </div>
      <form className="checkoutGrid" onSubmit={submit}>
        <div className="checkoutFields">
          <AnimateScroll><label><span className="labelIcon"><Phone size={14} /></span> الاسم الكامل<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.05}><label><span className="labelIcon"><Phone size={14} /></span> رقم الهاتف<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></label></AnimateScroll>
          <AnimateScroll delay={.1}><label><span className="labelIcon"><Mail size={14} /></span> البريد الإلكتروني<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.15}><label><span className="labelIcon"><MapPin size={14} /></span> المدينة<select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}><option>القاهرة</option><option>الإسكندرية</option><option>الجيزة</option><option>المنصورة</option><option>أخرى</option></select></label></AnimateScroll>
          <AnimateScroll delay={.2}><label className="wide"><span className="labelIcon"><MapPin size={14} /></span> العنوان بالتفصيل<textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label></AnimateScroll>
          <AnimateScroll delay={.25}><label><span className="labelIcon"><Gift size={14} /></span> المناسبة<select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}>{occasions.map(o => <option key={o}>{o}</option>)}</select></label></AnimateScroll>
          <AnimateScroll delay={.3}><label className="wide"><span className="labelIcon"><Edit3 size={14} /></span> الملاحظات<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="أي ملاحظات إضافية…" /></label></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="paymentSection">
              <p className="paymentTitle"><CreditCard size={16} /> طريقة الدفع</p>
              {([
                { key: 'cod', label: 'الدفع عند الاستلام', icon: <Truck size={16} /> },
                { key: 'fawry', label: 'فودافون كاش', icon: <DollarSign size={16} /> },
                { key: 'card', label: 'البطاقات الائتمانية', icon: <CreditCard size={16} /> }
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
            <h3>ملخص الطلب</h3>
            {cart.map(i => (
              <div key={i.id} className="summaryItem">
                <span>{i.name} × {i.qty}</span>
                <b>{money(i.price * i.qty)}</b>
              </div>
            ))}
            <hr />
            <div className="summaryItem"><span>المنتجات</span><b>{money(cartTotal)}</b></div>
            <div className="summaryItem"><span>الشحن</span><b className={shipping === 0 ? 'freeShipping' : ''}>{shipping ? money(shipping) : 'مجاني'}</b></div>

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
            <div className="summaryGrand"><span>الإجمالي</span><b>{money(finalTotal)}</b></div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: .96 }}>
              <button className="btn primary full btnLg" type="submit" disabled={!cart.length}>
                <Send size={18} /> تأكيد الطلب
              </button>
            </motion.div>
          </div>
        </AnimateScroll>
      </form>
    </motion.section>
  );
}

function TrackingPage() {
  const location = useLocation();
  const q = new URLSearchParams(location.search).get('order');
  const [order, setOrder] = useState<any>(null);
  const [input, setInput] = useState(q || '');
  const [found, setFound] = useState<boolean | null>(null);

  const statusList = ['قيد المراجعة', 'مؤكد', 'قيد التنفيذ', 'تم الشحن', 'تم التسليم'];
  const statusIdx = statusList.indexOf(order?.status || 'قيد المراجعة');

  const search = async () => {
    if (!input.trim()) return;
    if (supabase) {
      const { data } = await supabase.from('orders').select('*').eq('order_number', input.trim()).maybeSingle();
      setOrder(data); setFound(!!data);
    } else {
      const x = getLocal<any | null>('em-last-order', null);
      if (x?.orderNo === input.trim()) { setOrder(x); setFound(true); }
      else { setOrder(null); setFound(false); }
    }
  };

  useEffect(() => { if (q) { setInput(q); setTimeout(search, 300); } }, [q]);

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">ORDER TRACKING</span><h2>تتبعي طلبك</h2></div></AnimateScroll>
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
                <div><span>الحالة</span><b>{order.status || 'قيد المراجعة'}</b></div>
                <div><span>الإجمالي</span><b>{money(Number(order.total || 0))}</b></div>
                <div><span>العنوان</span><b>{order.city || '---'} - {order.address || '---'}</b></div>
              </div>
              <div className="trackingTimeline">
                {statusList.map((s, i) => (
                  <motion.span
                    key={s}
                    className={i <= statusIdx ? 'timelineStep active' : 'timelineStep'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * .1 }}
                  >
                    <i>{i <= statusIdx ? <Check size={14} /> : i + 1}</i>{s}
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
              <p>لعرض آخر حالة متاحة لطلبك.</p>
            </div>
          </AnimateScroll>
        )}
      </div>
    </motion.section>
  );
}

function LoginPage() {
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

function AdminPage() {
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
    ['orders', 'الطلبات', Package],
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
          { label: 'المبيعات', value: money(totalSales), Icon: TrendingUp, sub: 'إجمالي المبيعات' },
          { label: 'الطلبات', value: orders.length.toString(), Icon: Package, sub: 'عدد الطلبات' },
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
            <h3><Clock size={18} /> آخر الطلبات</h3>
            <span className="muted">{orders.length} طلب</span>
          </div>
          <div className="adminTable">
            <div className="adminTableRow header">
              <span>رقم الطلب</span><span>العميل</span><span>الإجمالي</span><span>الحالة</span><span>التاريخ</span>
            </div>
            {recentOrders.map(o => (
              <motion.div className="adminTableRow" key={o.id} whileHover={{ backgroundColor: 'var(--paper)' }}>
                <span><b>{o.order_number}</b></span>
                <span>{o.customer_name}</span>
                <span>{money(Number(o.total || 0))}</span>
                <span><span className={`badge ${o.status?.includes('تم التسليم') ? 'badgeSuccess' : o.status?.includes('تم الشحن') ? 'badgeInfo' : o.status?.includes('ملغي') ? 'badgeDanger' : 'badgeWarning'}`}>{o.status || 'قيد المراجعة'}</span></span>
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const deleteProduct = (id: string) => { setProducts(prev => prev.filter(p => p.id !== id)); setDeleteConfirm(null); };

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
              <label>القسم<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{occasions.map(o => <option key={o}>{o}</option>)}</select></label>
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
          <span>الصورة</span><span>المنتج</span><span>القسم</span><span>السعر</span><span>المخزون</span><span>الحالة</span><span>إجراءات</span>
        </div>
        <AnimatePresence>
          {products.map(p => (
            <motion.div className="adminTableRow" key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }} whileHover={{ backgroundColor: 'var(--paper)' }}>
              <span><img src={p.image} alt={p.name} className="tableThumb" /></span>
              <span><b>{p.name}</b><br /><small className="muted">{p.desc?.slice(0, 35)}…</small></span>
              <span>{p.category}</span>
              <span>{money(p.price)}</span>
              <span>
                <div className="stockBar"><i style={{ width: `${Math.min(100, (p.stock / 150) * 100)}%`, backgroundColor: p.stock < 20 ? 'var(--danger)' : p.stock < 50 ? 'var(--warn)' : 'var(--rose)' }} /></div>
                <small>{p.stock}</small>
              </span>
              <span>{p.stock > 0 ? <span className="badge badgeSuccess">نشط</span> : <span className="badge badgeDanger">نفذ</span>}</span>
              <span className="rowActions">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} onClick={() => startEdit(p)}><Edit3 size={14} /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} onClick={() => setDeleteConfirm(p.id)}><Trash2 size={14} /></motion.button>
              </span>
              {deleteConfirm === p.id && (
                <motion.div className="confirmOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span>حذف المنتج؟</span>
                  <motion.button className="btn danger" whileTap={{ scale: .95 }} onClick={() => deleteProduct(p.id)}>نعم</motion.button>
                  <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setDeleteConfirm(null)}>لا</motion.button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrdersAdmin({ orders, setOrders }: { orders: Order[]; setOrders: (o: Order[] | ((prev: Order[]) => Order[])) => void }) {
  const [filter, setFilter] = useState('الكل');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const statuses = ['الكل', 'قيد المراجعة', 'مؤكد', 'قيد التنفيذ', 'تم الشحن', 'تم التسليم'];
  const filtered = filter === 'الكل' ? orders : orders.filter(o => o.status === filter);

  const updateStatus = async (id: string, status: string) => {
    if (supabase) await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const statusColor = (s: string) => s?.includes('تم التسليم') ? 'badgeSuccess' : s?.includes('تم الشحن') ? 'badgeInfo' : s?.includes('ملغي') ? 'badgeDanger' : s?.includes('مؤكد') ? 'badgeSuccess' : 'badgeWarning';
  const allStatuses = ['قيد المراجعة', 'مؤكد', 'قيد التنفيذ', 'تم الشحن', 'تم التسليم'];

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Package size={18} /> إدارة الطلبات</h3>
        <span className="muted">{filtered.length} طلب</span>
      </div>
      <div className="filterTabs">
        {statuses.map(s => (
          <motion.button key={s} className={filter === s ? 'filterTab active' : 'filterTab'} onClick={() => setFilter(s)} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
            {s} ({s === 'الكل' ? orders.length : orders.filter(o => o.status === s).length})
          </motion.button>
        ))}
      </div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>رقم الطلب</span><span>العميل</span><span>الهاتف</span><span>الإجمالي</span><span>الحالة</span><span>التاريخ</span><span>إجراءات</span>
        </div>
        <AnimatePresence>
          {filtered.map(o => (
            <React.Fragment key={o.id}>
              <motion.div className="adminTableRow" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ backgroundColor: 'var(--paper)' }}>
                <span><b>{o.order_number}</b></span>
                <span>{o.customer_name}</span>
                <span dir="ltr">{o.customer_phone}</span>
                <span>{money(Number(o.total || 0))}</span>
                <span><span className={`badge ${statusColor(o.status || 'قيد المراجعة')}`}>{o.status || 'قيد المراجعة'}</span></span>
                <small>{o.created_at ? new Date(o.created_at).toLocaleDateString('ar-EG') : '---'}</small>
                <span className="rowActions">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}><Eye size={14} /></motion.button>
                  <select className="statusSelect" value={o.status || 'قيد المراجعة'} onChange={e => updateStatus(o.id, e.target.value)}>
                    {allStatuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                </span>
              </motion.div>
              <AnimatePresence>
                {expandedId === o.id && (
                  <motion.div className="orderExpand" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
                    <div className="orderExpandContent">
                      <div className="orderExpandGrid">
                        <div><Mail size={14} /> البريد: {o.customer_email || '---'}</div>
                        <div><MapPin size={14} /> العنوان: {o.city} - {o.address}</div>
                        <div><Gift size={14} /> المناسبة: {o.occasion || '---'}</div>
                        <div><CreditCard size={14} /> الدفع: {o.payment_method === 'cod' ? 'عند الاستلام' : o.payment_method === 'fawry' ? 'فودافون كاش' : 'بطاقة ائتمانية'}</div>
                        {o.notes && <div className="orderNotes"><Edit3 size={14} /> ملاحظات: {o.notes}</div>}
                      </div>
                      <div className="trackingTimeline mini">
                        {allStatuses.map((s, i) => (
                          <motion.span key={s} className={i <= allStatuses.indexOf(o.status || 'قيد المراجعة') ? 'timelineStep active' : 'timelineStep'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}>
                            <i>{i <= allStatuses.indexOf(o.status || 'قيد المراجعة') ? <Check size={12} /> : i + 1}</i>{s}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </AnimatePresence>
        {!filtered.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>لا توجد طلبات في هذه الفئة.</span></div>}
      </div>
    </div>
  );
}

function CustomersAdmin({ customers, orders }: { customers: Customer[]; orders: Order[] }) {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filtered = customers.filter(c => c.name.includes(search) || c.email.includes(search) || c.phone.includes(search));
  const customerOrders = selectedCustomer ? orders.filter(o => o.customer_name === selectedCustomer) : [];

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Users size={18} /> إدارة العملاء</h3>
        <span className="muted">{filtered.length} عميل</span>
      </div>
      <div className="searchBar" style={{ marginBottom: 16 }}><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن عميل…" /></div>
      <div className="adminTable">
        <div className="adminTableRow header">
          <span>العميل</span><span>البريد</span><span>الهاتف</span><span>الطلبات</span><span>إجمالي المشتريات</span><span>إجراءات</span>
        </div>
        {filtered.map(c => (
          <motion.div className="adminTableRow" key={c.name} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b>{c.name}</b></span>
            <span>{c.email || '---'}</span>
            <span dir="ltr">{c.phone || '---'}</span>
            <span>{c.ordersCount}</span>
            <span>{money(c.totalSpent)}</span>
            <span className="rowActions">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} onClick={() => setSelectedCustomer(selectedCustomer === c.name ? null : c.name)}><Eye size={14} /></motion.button>
            </span>
          </motion.div>
        ))}
        {!filtered.length && <div className="adminTableRow"><span className="muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>لا يوجد عملاء بعد.</span></div>}
      </div>
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div className="adminPanel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ marginTop: 16 }}>
            <div className="panelHead">
              <h3>طلبات {selectedCustomer}</h3>
              <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setSelectedCustomer(null)}><X size={14} /> إغلاق</motion.button>
            </div>
            <div className="adminTable">
              <div className="adminTableRow header">
                <span>رقم الطلب</span><span>الإجمالي</span><span>الحالة</span><span>التاريخ</span>
              </div>
              {customerOrders.map(o => (
                <div className="adminTableRow" key={o.id}>
                  <span>{o.order_number}</span>
                  <span>{money(Number(o.total || 0))}</span>
                  <span><span className={`badge ${o.status?.includes('تم التسليم') ? 'badgeSuccess' : 'badgeWarning'}`}>{o.status || 'قيد المراجعة'}</span></span>
                  <small>{o.created_at ? new Date(o.created_at).toLocaleDateString('ar-EG') : '---'}</small>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CouponsAdmin({ coupons, setCoupons }: { coupons: Coupon[]; setCoupons: (c: Coupon[] | ((prev: Coupon[]) => Coupon[])) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percent' as 'percent' | 'fixed', maxUsage: '', minOrder: '', expiry: '', active: true });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => { setForm({ code: '', discount: '', type: 'percent', maxUsage: '', minOrder: '', expiry: '', active: true }); setEditId(null); setShowForm(false); };
  const startEdit = (c: Coupon) => { setForm({ code: c.code, discount: String(c.discount), type: c.type, maxUsage: String(c.maxUsage), minOrder: String(c.minOrder), expiry: c.expiry, active: c.active }); setEditId(c.id); setShowForm(true); };

  const saveCoupon = () => {
    if (!form.code || !form.discount) return;
    if (editId) {
      setCoupons(prev => prev.map(c => c.id === editId ? { ...c, code: form.code.toUpperCase(), discount: Number(form.discount), type: form.type, maxUsage: Number(form.maxUsage), minOrder: Number(form.minOrder), expiry: form.expiry, active: form.active } : c));
    } else {
      setCoupons(prev => [...prev, { id: `c${Date.now()}`, code: form.code.toUpperCase(), discount: Number(form.discount), type: form.type, maxUsage: Number(form.maxUsage) || 100, usageCount: 0, minOrder: Number(form.minOrder) || 0, expiry: form.expiry, active: form.active }]);
    }
    resetForm();
  };

  const toggleActive = (id: string) => setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const deleteCoupon = (id: string) => { setCoupons(prev => prev.filter(c => c.id !== id)); setDeleteConfirm(null); };

  return (
    <div className="adminPanel">
      <div className="panelHead">
        <h3><Tag size={18} /> إدارة الكوبونات</h3>
        <motion.button className="btn primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? <X size={16} /> : <><Plus size={16} /> إضافة كوبون</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="adminForm" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .3 }}>
            <div className="formGrid">
              <label><Hash size={14} /> الكود<input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="MOMENTS10" required /></label>
              <label><DollarSign size={14} /> الخصم<input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} required /></label>
              <label>النوع<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}><option value="percent">نسبة مئوية %</option><option value="fixed">مبلغ ثابت</option></select></label>
              <label><Tag size={14} /> الحد الأقصى<input type="number" min="0" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} placeholder="100" /></label>
              <label><DollarSign size={14} /> الحد الأدنى (ج.م)<input type="number" min="0" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: e.target.value })} placeholder="200" /></label>
              <label><Calendar size={14} /> الانتهاء<input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} /></label>
              <label className="wide checkboxLabel"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> <Check size={14} /> نشط</label>
            </div>
            <div className="formActions">
              <motion.button className="btn primary" whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }} onClick={saveCoupon}><Check size={16} /> {editId ? 'تحديث' : 'إضافة'}</motion.button>
              <motion.button className="btn ghost" whileTap={{ scale: .97 }} onClick={resetForm}>إلغاء</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="adminTable">
        <div className="adminTableRow header">
          <span>الكود</span><span>الخصم</span><span>النوع</span><span>الاستخدام</span><span>الحد الأدنى</span><span>الانتهاء</span><span>الحالة</span><span>إجراءات</span>
        </div>
        {coupons.map(c => (
          <motion.div className="adminTableRow" key={c.id} whileHover={{ backgroundColor: 'var(--paper)' }}>
            <span><b className="couponCode">{c.code}</b></span>
            <span>{c.type === 'percent' ? `${c.discount}%` : money(c.discount)}</span>
            <span>{c.type === 'percent' ? 'نسبة' : 'ثابت'}</span>
            <span>{c.usageCount}/{c.maxUsage}</span>
            <span>{c.minOrder ? money(c.minOrder) : '---'}</span>
            <small>{c.expiry || '---'}</small>
            <span><motion.button className={c.active ? 'toggleBtn active' : 'toggleBtn'} whileTap={{ scale: .9 }} onClick={() => toggleActive(c.id)}>{c.active ? 'نشط' : 'معطل'}</motion.button></span>
            <span className="rowActions">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} onClick={() => startEdit(c)}><Edit3 size={14} /></motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }} onClick={() => setDeleteConfirm(c.id)}><Trash2 size={14} /></motion.button>
            </span>
            {deleteConfirm === c.id && (
              <motion.div className="confirmOverlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span>حذف الكوبون؟</span>
                <motion.button className="btn danger" whileTap={{ scale: .95 }} onClick={() => deleteCoupon(c.id)}>نعم</motion.button>
                <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setDeleteConfirm(null)}>لا</motion.button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SettingsAdmin({ settings, setSettings }: { settings: any; setSettings: (s: any) => void }) {
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (supabase) await supabase.from('settings').upsert({ key: 'store', value: settings });
    localStorage.setItem('em-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="adminPanel settingsPanel">
      <div className="panelHead"><h3><Settings size={18} /> إعدادات المتجر</h3></div>

      <div className="settingsGroup">
        <h4><Store size={16} /> معلومات المتجر</h4>
        <div className="formGrid">
          <label>اسم المتجر<input value={settings.storeName} onChange={e => setSettings({ ...settings, storeName: e.target.value })} /></label>
          <label className="wide">وصف المتجر<textarea value={settings.storeDesc} onChange={e => setSettings({ ...settings, storeDesc: e.target.value })} /></label>
          <label className="wide"><ImageIcon size={14} /> رابط الشعار<input value={settings.logoUrl} onChange={e => setSettings({ ...settings, logoUrl: e.target.value })} placeholder="/images/logo.jpeg" /></label>
        </div>
      </div>

      <div className="settingsGroup">
        <h4><Truck size={16} /> إعدادات الشحن</h4>
        <div className="formGrid">
          <label><DollarSign size={14} /> رسوم الشحن (ج.م)<input type="number" min="0" value={settings.shippingFee} onChange={e => setSettings({ ...settings, shippingFee: e.target.value })} /></label>
          <label><Gift size={14} /> الشحن المجاني فوق (ج.م)<input type="number" min="0" value={settings.freeShippingThreshold} onChange={e => setSettings({ ...settings, freeShippingThreshold: e.target.value })} /></label>
        </div>
      </div>

      <div className="settingsGroup">
        <h4><Phone size={16} /> معلومات التواصل</h4>
        <div className="formGrid">
          <label><MessageCircle size={14} /> واتساب<input value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="201xxxxxxxxx" /></label>
          <label><Mail size={14} /> البريد<input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /></label>
          <label><Phone size={14} /> الهاتف<input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="01000000000" /></label>
        </div>
      </div>

      <div className="settingsGroup">
        <h4><Globe size={16} /> وسائل التواصل</h4>
        <div className="formGrid">
          <label><Instagram size={14} /> Instagram<input value={settings.instagram} onChange={e => setSettings({ ...settings, instagram: e.target.value })} /></label>
          <label><Music size={14} /> TikTok<input value={settings.tiktok} onChange={e => setSettings({ ...settings, tiktok: e.target.value })} /></label>
        </div>
      </div>

      <div className="formActions">
        <motion.button className="btn primary" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: .97 }} onClick={save}>
          {saved ? <><Check size={16} /> تم الحفظ!</> : <><Send size={16} /> حفظ الإعدادات</>}
        </motion.button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <AnimateScroll>
      <footer className="footer">
        <div className="footerGrid">
          <div className="footerBrand">
            <div className="brand">
              <span className="brandMark"><img src="/images/logo.jpeg" alt="Esraa Moments" /></span>
              <span className="brandText"><b>ESRAA</b><small>Moments</small></span>
            </div>
            <p>تفاصيل صغيرة… تصنع لحظات لا تُنسى.</p>
            <p className="footerSub">توزيعات وهدايا مصممة بعناية لكل مناسبة خاصة.</p>
          </div>

          <div className="footerCol">
            <b>روابط سريعة</b>
            <Link to="/shop"><Store size={14} /> المتجر</Link>
            <Link to="/custom"><Sparkles size={14} /> التخصيص</Link>
            <Link to="/track"><MapPin size={14} /> تتبع الطلب</Link>
            <Link to="/login"><LogIn size={14} /> حسابي</Link>
          </div>

          <div className="footerCol">
            <b>المناسبات</b>
            {occasions.map(o => <Link key={o} to={`/shop?cat=${encodeURIComponent(o)}`}>{o}</Link>)}
          </div>

          <div className="footerCol">
            <b>تواصل معنا</b>
            <a href="https://www.instagram.com/esraamomentsstore" target="_blank" rel="noreferrer"><Instagram size={14} /> Instagram</a>
            <a href="https://www.tiktok.com/@esraamomentsstore" target="_blank" rel="noreferrer"><Music size={14} /> TikTok</a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer"><MessageCircle size={14} /> WhatsApp</a>
          </div>
        </div>

        <div className="footerBottom">
          <p>© {new Date().getFullYear()} ESRAA Moments. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </AnimateScroll>
  );
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
