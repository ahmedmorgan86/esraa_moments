import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { AnimateScroll, StaggerContainer, StaggerItem, pageVariants } from '../components/motion';
import { ProductCard } from '../components/ProductCard';
import { occasions } from '../data';
import type { Product } from '../data';
import { occLabel, translations } from '../i18n';

export function ShopPage({ products, addToCart, wish, setWish, t }: { products: Product[]; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const location = useLocation();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(new URLSearchParams(location.search).get('cat') || '');
  const [sort, setSort] = useState('');

  useEffect(() => { setCat(new URLSearchParams(location.search).get('cat') || ''); }, [location.search]);

  const cats = useMemo(() => {
    const seen: string[] = [];
    products.forEach(p => { if (p.category && !seen.includes(p.category)) seen.push(p.category); });
    const ordered = occasions.filter(o => seen.includes(o));
    const rest = seen.filter(c => !occasions.includes(c));
    return [...ordered, ...rest];
  }, [products]);

  const filtered = useMemo(() => {
    let items = products.filter(p => (!cat || p.category === cat) && (p.name + p.category + p.desc + (p.name_en || '') + (p.desc_en || '')).toLowerCase().includes(q.toLowerCase()));
    if (sort === 'priceLow') items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === 'priceHigh') items = [...items].sort((a, b) => b.price - a.price);
    else if (sort === 'newest') items = [...items].reverse();
    return items;
  }, [products, cat, q, sort]);

  return (
    <motion.section className="section page" {...pageVariants}>
      <div className="sectionHead">
        <AnimateScroll><div><span className="eyebrow">{t.ebShop}</span><h2>{t.shopTitle}</h2></div></AnimateScroll>
      </div>

      <div className="shopToolbar">
        <AnimateScroll>
          <div className="searchBar"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder={t.searchPlaceholder} /></div>
        </AnimateScroll>
        <AnimateScroll delay={.05}>
          <div className="shopSort">
            <Filter size={16} />
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">{t.sortAll}</option>
              <option value="priceLow">{t.sortPriceLow}</option>
              <option value="priceHigh">{t.sortPriceHigh}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
          </div>
        </AnimateScroll>
      </div>

      <AnimateScroll>
        <div className="filterPills">
          <motion.button className={!cat ? 'pill active' : 'pill'} onClick={() => setCat('')} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>{t.allPill}</motion.button>
          {cats.map(o => (
            <motion.button key={o} className={cat === o ? 'pill active' : 'pill'} onClick={() => setCat(o)} whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
              {occLabel(o)}
            </motion.button>
          ))}
        </div>
      </AnimateScroll>

      <p className="productCount">{filtered.length} {t.productsCountWord}</p>

      <StaggerContainer className="productGrid">
        {filtered.map(p => (
          <StaggerItem key={p.id}>
            <ProductCard p={p} addToCart={addToCart} wish={wish} setWish={setWish} t={t} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {!filtered.length && (
        <AnimateScroll>
          <div className="emptyState">
            <Search size={48} strokeWidth={1} />
            <h3>{t.noResultsTitle}</h3>
            <p>{t.noResultsSub}</p>
          </div>
        </AnimateScroll>
      )}
    </motion.section>
  );
}
