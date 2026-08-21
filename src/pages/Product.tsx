import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Minus, Plus, ShoppingBag, Heart, ChevronDown } from 'lucide-react';
import { AnimateScroll, StaggerContainer, StaggerItem, pageVariants } from '../components/motion';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../data';
import { occLabel, prodName, prodDesc, translations } from '../i18n';
import { money, ease } from '../lib';

export function ProductPage({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
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
          <AnimateScroll delay={.1}><span className="eyebrow">{occLabel(p.category)}</span></AnimateScroll>
          <AnimateScroll delay={.15}><h1>{prodName(p)}</h1></AnimateScroll>
          <AnimateScroll delay={.2}><strong className="detailPrice priceGrad">{money(p.price)}</strong></AnimateScroll>
          <AnimateScroll delay={.25}>
            <div className="stockBadge">
              <ShieldCheck size={16} />
              {p.stock > 0 ? `${t.available} • ${p.stock} ${t.pieces}` : t.outStock}
            </div>
          </AnimateScroll>
          <AnimateScroll delay={.3}><p className="productLead">{prodDesc(p)}</p></AnimateScroll>

          <AnimateScroll delay={.35}>
            <div className="qtySelector">
              <span>{t.qty}</span>
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
                      {t.details.map((d, i) => <p key={i}><b>{d.l}:</b> {d.t}</p>)}
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
            <AnimateScroll><div><span className="eyebrow">{t.ebRelated}</span><h2>{t.relatedTitle}</h2></div></AnimateScroll>
          </div>
          <StaggerContainer className="productGrid">
            {related.map(rp => (
              <StaggerItem key={rp.id}>
                <ProductCard p={rp} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}
    </motion.section>
  );
}
