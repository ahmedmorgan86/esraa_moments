import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronDown, Check, Send } from 'lucide-react';
import { AnimateScroll, StaggerContainer, StaggerItem } from '../components/motion';
import { ProductCard } from '../components/ProductCard';
import { occasions } from '../data';
import type { Product } from '../data';
import { occLabel, prodName, translations } from '../i18n';
import { money, ease, getLocal } from '../lib';

export function Home({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const faqData = t.faqs;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [newsEmail, setNewsEmail] = useState('');
  const [newsDone, setNewsDone] = useState(false);
  const bestSellers = useMemo(() => [...products].sort((a, b) => b.stock - a.stock).slice(0, 6), [products]);

  const subscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsEmail)) return;
    const list = getLocal<string[]>('em-newsletter', []);
    if (!list.includes(newsEmail)) localStorage.setItem('em-newsletter', JSON.stringify([...list, newsEmail]));
    setNewsDone(true);
  };

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
            {t.heroTitleA}<br /><em>{t.heroTitleEm}</em>{t.heroTitleB ? ` ${t.heroTitleB}` : ''}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7, delay: .6, ease }}
          >
            {t.heroDesc}
          </motion.p>
          <motion.div
            className="heroCta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .8, ease }}
          >
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: .96 }}>
              <Link className="btn primary btnLg" to="/shop">{t.exploreFavors} <ArrowLeft size={18} className="flip-x" /></Link>
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
            {t.madeWithLove}<br /><small>{t.forYourMoments}</small>
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
                  <b>{occLabel(o)}</b>
                  <ArrowLeft size={18} className="flip-x" />
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
            <Link className="textLink" to="/shop">{t.allCollection} <ArrowLeft size={16} className="flip-x" /></Link>
          </AnimateScroll>
        </div>
        <StaggerContainer className="productGrid">
          {products.filter(x => x.featured).map(p => (
            <StaggerItem key={p.id}>
              <ProductCard p={p} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section brandStory" id="about">
        <div className="brandStoryInner">
          <AnimateScroll>
            <span className="eyebrow">{t.storyEyebrow}</span>
            <h2>{t.storyTitle} <em>{t.storyTitleAccent}</em></h2>
            <blockquote className="storyQuote">
              {t.storyQuote}
            </blockquote>
            <p>
              {t.storyText}
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
            <Link className="textLink" to="/shop">{t.viewAll} <ArrowLeft size={16} className="flip-x" /></Link>
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
                <img src={p.image} alt={prodName(p)} />
                <div>
                  <span className="bsRank">#{i + 1}</span>
                  <h4>{prodName(p)}</h4>
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
              {newsDone ? (
                <p className="newsDone"><Check size={16} /> {t.newsDone}</p>
              ) : (
                <>
                  <input type="email" value={newsEmail} onChange={e => setNewsEmail(e.target.value)} placeholder={t.yourEmail} onKeyDown={e => e.key === 'Enter' && subscribe()} />
                  <motion.button className="btn primary" whileHover={{ y: -2 }} whileTap={{ scale: .96 }} onClick={subscribe}>
                    <Send size={16} /> {t.subscribeBtn}
                  </motion.button>
                </>
              )}
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
