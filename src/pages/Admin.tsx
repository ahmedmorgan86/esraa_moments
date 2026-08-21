import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, Palette, Box, Users, Tag, Settings, LogIn, LogOut,
  Store, TrendingUp, Clock, AlertTriangle, Sparkles, Plus, Download, X, Check,
  Trash2, Edit3, Eye, DollarSign, Star, Image as ImageIcon
} from 'lucide-react';
import { AnimateScale, StaggerContainer, StaggerItem, pageVariants } from '../components/motion';
import { supabase } from '../lib/supabase';
import { seed, occasions } from '../data';
import type { Product, Order, Customer, Coupon } from '../data';
import {
  translations, uiLang, orderStatusLabels, paymentStatusLabels, orderStatusLabel,
  paymentStatusLabel, occLabel, pickLabel, favorTypeEn, colorEn, prodName, prodDesc
} from '../i18n';
import { money, getLocal } from '../lib';

export function AdminPage({ t }: { t: typeof translations.ar }) {
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
