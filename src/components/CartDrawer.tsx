import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { prodName } from '../i18n';
import type { CartItem } from '../data';
import { translations } from '../i18n';
import { money, getLocal, ease } from '../lib';

export function CartDrawer({
  open, onClose, cart, changeQty, remove, total, t
}: {
  open: boolean; onClose: () => void; cart: CartItem[];
  changeQty: (id: string, d: number) => void; remove: (id: string) => void;
  total: number; t: typeof translations.ar;
}) {
  const storeCfg = getLocal<any | null>('em-settings', null);
  const SHIP_FEE = Number(storeCfg?.shippingFee) > 0 ? Number(storeCfg.shippingFee) : 25;
  const FREE_OVER = Number(storeCfg?.freeShippingThreshold) || 500;
  const shipping = total >= FREE_OVER || !total ? 0 : SHIP_FEE;
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
                <h3>{t.cartEmptyTitle}</h3>
                <p>{t.cartEmptySub}</p>
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
                        <img src={item.image} alt={prodName(item)} className="cartDrawerImg" />
                        <div className="cartDrawerInfo">
                          <Link to={`/product/${item.id}`} onClick={onClose}>{prodName(item)}</Link>
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
                    {total < FREE_OVER && total > 0 && <p className="shippingHint">{t.freeShippingHint}</p>}
                    <hr />
                    <div className="cartDrawerGrand"><span>{t.total}</span><b>{money(total + shipping)}</b></div>
                  </div>
                  <motion.button
                    className="btn primary full"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: .97 }}
                    onClick={() => { onClose(); nav('/checkout'); }}
                  >
                    {t.checkout} <ArrowLeft size={18} className="flip-x" />
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
