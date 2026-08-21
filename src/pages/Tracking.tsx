import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Search, Package, CreditCard, Upload, Check, MapPin } from 'lucide-react';
import { AnimateScroll, pageVariants } from '../components/motion';
import { supabase } from '../lib/supabase';
import { orderStatusLabels, orderStatusLabel, paymentStatusLabel, uiLang, translations } from '../i18n';
import { money, getLocal, ease } from '../lib';

export function TrackingPage({ t }: { t: typeof translations.ar }) {
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
