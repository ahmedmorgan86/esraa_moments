import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Plus } from 'lucide-react';
import { prodName, prodDesc, occLabel, translations } from '../i18n';
import type { Product } from '../data';
import { money, ease } from '../lib';

export function ProductCard({ p, addToCart, wish, setWish, t }: { p: Product; addToCart: (p: Product) => void; wish: string[]; setWish: (x: string[]) => void; t: typeof translations.ar }) {
  const liked = wish.includes(p.id);
  return (
    <motion.article
      className="productCard"
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(50,30,20,.12)' }}
      transition={{ duration: .4, ease }}
    >
      <Link to={`/product/${p.id}`} className="productCardImage">
        <motion.img src={p.image} alt={prodName(p)} whileHover={{ scale: 1.05 }} transition={{ duration: .7, ease }} />
        <motion.button
          type="button"
          className="wishBtn"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: .8 }}
          onClick={e => { e.preventDefault(); setWish(liked ? wish.filter(x => x !== p.id) : [...wish, p.id]); }}
          aria-label="Wishlist"
        >
          <Heart fill={liked ? 'var(--rose)' : 'none'} color={liked ? 'var(--rose)' : 'currentColor'} size={18} />
        </motion.button>
        <span className="productCatTag">{occLabel(p.category)}</span>
      </Link>
      <div className="productCardBody">
        <Link to={`/product/${p.id}`}><h3>{prodName(p)}</h3></Link>
        <p className="productDesc">{prodDesc(p)}</p>
        <div className="productCardFooter">
          <strong className="priceGrad">{money(p.price)}</strong>
          <motion.button
            className="addCartBtn"
            whileHover={{ scale: 1.05, backgroundColor: 'var(--ink)', color: 'var(--bg)' }}
            whileTap={{ scale: .95 }}
            onClick={() => addToCart(p)}
          >
            {t.addShort} <Plus size={16} />
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
