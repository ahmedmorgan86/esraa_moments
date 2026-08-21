import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Gift, Edit3, CreditCard, DollarSign, Send, Check, ShoppingBag, User } from 'lucide-react';
import { AnimateScroll, pageVariants } from '../components/motion';
import { supabase } from '../lib/supabase';
import { occasions } from '../data';
import type { CartItem, Coupon } from '../data';
import { uiLang, pickLabel, cityEn, occLabel, prodName, translations } from '../i18n';
import { money, getLocal, ease } from '../lib';

type SetCart = React.Dispatch<React.SetStateAction<CartItem[]>>;

export function CheckoutPage({ cart, setCart, cartTotal, t }: { cart: CartItem[]; setCart: SetCart; cartTotal: number; t: typeof translations.ar }) {
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
        <AnimateScroll><div><span className="eyebrow">{t.ebOrderReq}</span><h2>{t.checkoutTitle}</h2></div></AnimateScroll>
      </div>
      <form className="checkoutGrid" onSubmit={submit}>
        <div className="checkoutFields">
          <AnimateScroll><label><span className="labelIcon"><User size={14} /></span> {t.fullName}<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label></AnimateScroll>
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
