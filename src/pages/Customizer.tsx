import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, Package, ShoppingBag, Gift, Sparkles, Check, Edit3, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { AnimateScroll, pageVariants } from '../components/motion';
import { supabase } from '../lib/supabase';
import { occasions, PALETTES } from '../data';
import type { Design } from '../data';
import { occLabel, pickLabel, favorTypeEn, colorEn, translations } from '../i18n';
import { getLocal, ease } from '../lib';

const TYPE_ICONS: Record<string, any> = { 'علبة': Box, 'برطمان': Package, 'كيس فاخر': ShoppingBag, 'بوكس هدية': Gift };
const QTY_PRESETS = [15, 25, 50, 100];

export function Customizer({ t }: { t: typeof translations.ar }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Design>({ occasion: 'زفاف', type: 'علبة', qty: 30, color: 'آيفوري وذهبي', name: '', date: '', extras: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errFields, setErrFields] = useState<string[]>([]);
  const pal = PALETTES[form.color] || PALETTES['آيفوري وذهبي'];
  const TypeIcon = TYPE_ICONS[form.type] || Gift;
  const monogram = (form.name.trim()[0] || 'E').toUpperCase();
  const today = new Date().toISOString().slice(0, 10);

  const update = (patch: Partial<Design>) => {
    const next = { ...form, ...patch };
    setForm(next);
    if (errFields.length) {
      const still: string[] = [];
      if (!next.name.trim()) still.push(t.printedName);
      if (!next.date) still.push(t.dateLabel);
      if (!next.extras.trim()) still.push(t.extraNotes);
      setErrFields(still);
    }
  };

  const submit = async () => {
    if (sending) return;
    const missing: string[] = [];
    if (!form.name.trim()) missing.push(t.printedName);
    if (!form.date) missing.push(t.dateLabel);
    if (!form.extras.trim()) missing.push(t.extraNotes);
    if (missing.length) { setErrFields(missing); setStep(2); return; }
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
          <span className="eyebrow">{t.ebStudio}</span>
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
            <motion.span key={'occ' + form.occasion} className="previewOcc" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
              <Gift size={12} /> {occLabel(form.occasion)}
            </motion.span>
            <motion.span key={monogram + form.name} className="monogram" initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>{monogram}</motion.span>
            <div className="favorText">
              <motion.b key={form.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>{form.name || t.previewNamePh}</motion.b>
              <small>{form.date || t.previewDatePh}</small>
            </div>
            <div className="favorTags">
              <motion.div key={form.type + form.color} className="favorMeta" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .3 }}>
                <TypeIcon size={13} /> {pickLabel(form.type, favorTypeEn)}<i>•</i>{pickLabel(form.color, colorEn)}
              </motion.div>
              <motion.div key={'q' + form.qty} className="favorQty" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .3 }}>
                {form.qty} {t.piecesWord}
              </motion.div>
            </div>
            <div className="swatchRow">
              {Object.keys(PALETTES).map(c => (
                <button key={c} type="button" title={pickLabel(c, colorEn)} className={c === form.color ? 'swatch on' : 'swatch'} style={{ background: PALETTES[c].deep }} onClick={() => update({ color: c })} />
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
                          <button key={o} type="button" className={form.occasion === o ? 'occCard on' : 'occCard'} onClick={() => update({ occasion: o })}>
                            <span className="occIdx">{String(i + 1).padStart(2, '0')}</span>
                            <b>{occLabel(o)}</b>
                            <ArrowLeft size={15} className="flip-x occArrow" />
                          </button>
                        ))}
                      </div>
                    )}
                    {step === 1 && (
                      <div className="typeGrid">
                        {(['علبة', 'برطمان', 'كيس فاخر', 'بوكس هدية'] as const).map(ty => {
                          const I = TYPE_ICONS[ty] || Gift;
                          return (
                            <button key={ty} type="button" className={form.type === ty ? 'typeCard on' : 'typeCard'} onClick={() => update({ type: ty })}>
                              <I size={24} strokeWidth={1.6} />
                              <b>{pickLabel(ty, favorTypeEn)}</b>
                              <small className="typeDesc">{(t.typeDescs as Record<string, string>)[ty]}</small>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {step === 2 && (
                      <div className="formGrid">
                        <div className="qtyField">
                          <label>{t.qty}<span className="req">*</span><input type="number" min="1" required value={form.qty} onChange={e => update({ qty: Math.max(1, +e.target.value || 1) })} /></label>
                          <div className="qtyChips">
                            {QTY_PRESETS.map(n => (
                              <button key={n} type="button" className={form.qty === n ? 'qtyChip on' : 'qtyChip'} onClick={() => update({ qty: n })}>{n}+</button>
                            ))}
                          </div>
                        </div>
                        <label>{t.sColor}<span className="req">*</span><select value={form.color} onChange={e => update({ color: e.target.value })}>{Object.keys(PALETTES).map(c => <option key={c} value={c}>{pickLabel(c, colorEn)}</option>)}</select></label>
                        <label className="wide">{t.printedName}<span className="req">*</span><input value={form.name} onChange={e => update({ name: e.target.value })} placeholder={t.namePlaceholder} /></label>
                        <label className="wide">{t.dateLabel}<span className="req">*</span><input type="date" min={today} value={form.date} onChange={e => update({ date: e.target.value })} /></label>
                        <label className="wide">{t.extraNotes}<span className="req">*</span><textarea value={form.extras} onChange={e => update({ extras: e.target.value })} placeholder={t.extrasPlaceholder} /></label>
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
                        <div className="summaryRow link" onClick={() => setStep(2)}><span>{t.sNotes}</span><b>{form.extras || '---'}</b><Edit3 size={13} /></div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {!sent && errFields.length > 0 && (
                  <motion.div className="custError" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <AlertCircle size={17} />
                    <div>
                      <b>{t.custErrTitle}</b>
                      <ul>{errFields.map(f => <li key={f}>{f}</li>)}</ul>
                    </div>
                  </motion.div>
                )}

                <div className="stepNav">
                  {step > 0 ? (
                    <motion.button className="btn ghost" whileTap={{ scale: .95 }} onClick={() => setStep(step - 1)}>
                      <ArrowRight size={16} className="flip-x" /> {t.prevBtn}
                    </motion.button>
                  ) : <span />}
                  {step < 3 ? (
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
