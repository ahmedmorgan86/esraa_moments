import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Globe, Sun, Moon } from 'lucide-react';
import { useScrollShadow } from '../hooks';
import { translations } from '../i18n';
import type { Lang } from '../i18n';
import { ease } from '../lib';

export function Header({
  cartCount, menu, setMenu, dark, setDark, lang, setLang, t, onCartClick
}: {
  cartCount: number; menu: boolean; setMenu: (v: boolean) => void;
  dark: boolean; setDark: (v: boolean) => void;
  lang: Lang; setLang: (l: Lang) => void;
  t: typeof translations.ar; onCartClick: () => void;
}) {
  const scrolled = useScrollShadow();
  return (
    <motion.header
      className={`header ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -82 }}
      animate={{ y: 0 }}
      transition={{ duration: .6, ease }}
    >
      <div className="header-inner">
        <button className="nav-mobile-toggle mobileOnly" onClick={() => setMenu(!menu)} aria-label="Menu">
          <span></span>
        </button>

        <Link to="/" className="brand">
          <motion.img src="/images/logo.jpeg" alt="Esraa Moments" className="brand-logo" whileHover={{ scale: 1.08 }} transition={{ duration: .4 }} />
          <span className="brand-text"><b>ESRAA</b> <small>Moments</small></span>
        </Link>

        <nav className={`nav-desktop ${menu ? 'mobile-active' : ''}`}>
          <Link to="/shop" className="nav-link" onClick={() => setMenu(false)}>{t.store}</Link>
          <Link to="/custom" className="nav-link" onClick={() => setMenu(false)}>{t.designStudio}</Link>
          <Link to="/#about" className="nav-link" onClick={() => setMenu(false)}>{t.aboutUs}</Link>
          <Link to="/#faq" className="nav-link" onClick={() => setMenu(false)}>{t.faq}</Link>
          <Link to="/track" className="nav-link" onClick={() => setMenu(false)}>{t.track}</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.button
            className="header-btn"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: .95 }}
            title="Switch Language"
          >
            <Globe size={18} />
          </motion.button>

          <motion.button
            className="header-btn"
            onClick={() => setDark(!dark)}
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: .9 }}
            transition={{ duration: .4 }}
            aria-label="Toggle Theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.button className="header-btn" onClick={onCartClick} whileHover={{ scale: 1.15 }} whileTap={{ scale: .9 }} aria-label="Cart">
            <ShoppingBag size={18} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.i
                  className="count"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {cartCount}
                </motion.i>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
