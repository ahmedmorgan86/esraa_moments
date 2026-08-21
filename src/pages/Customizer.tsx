import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, Package, ShoppingBag, Gift, Sparkles, Check, Edit3, ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimateScroll, pageVariants } from '../components/motion';
import { supabase } from '../lib/supabase';
import { occasions, PALETTES } from '../data';
import type { Design } from '../data';
import { occLabel, pickLabel, favorTypeEn, colorEn, translations } from '../i18n';
import { getLocal, ease } from '../lib';

const TYPE_ICONS: Record<string, any> = { 'علبة': Box, 'برطمان': Package, 'كيس فاخر': ShoppingBag, 'بوكس هدية': Gift };

export function Customizer({ t }: { t: typeof translations.ar }) {
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
