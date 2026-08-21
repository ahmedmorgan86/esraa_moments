import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Music, MapPin, Phone, Mail } from 'lucide-react';
import { occasions } from '../data';
import { occLabel, translations } from '../i18n';
import { getLocal } from '../lib';

export function Footer({ t }: { t: typeof translations.ar }) {
  const storeCfg = getLocal<any | null>('em-settings', null);
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div className="footerCol">
          <Link to="/" className="brand footerBrand">
            <span className="brandMark"><img src="/images/logo.jpeg" alt="Esraa Moments" /></span>
            <span className="brandText"><b>ESRAA</b><small>Moments</small></span>
          </Link>
          <p className="footerDesc">{t.footerDesc}</p>
          <div className="socialLinks">
            <motion.a href={storeCfg?.instagram || 'https://www.instagram.com/esraamomentsstore'} target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="Instagram">
              <Instagram size={20} />
            </motion.a>
            <motion.a href={`https://wa.me/${storeCfg?.whatsapp || '201097905455'}`} target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="WhatsApp">
              <MessageCircle size={20} />
            </motion.a>
            <motion.a href={storeCfg?.tiktok || 'https://www.tiktok.com/@esraamomentsstore'} target="_blank" rel="noreferrer" whileHover={{ scale: 1.2, color: 'var(--accent)' }} aria-label="TikTok">
              <Music size={20} />
            </motion.a>
          </div>
        </div>

        <div className="footerCol">
          <h4>{t.store}</h4>
          <ul>
            {occasions.slice(0, 6).map(o => (
              <li key={o}><Link to={`/shop?cat=${encodeURIComponent(o)}`}>{occLabel(o)}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footerCol">
          <h4>{t.quickLinks}</h4>
          <ul>
            <li><Link to="/custom">{t.designStudio}</Link></li>
            <li><Link to="/track">{t.track}</Link></li>
            <li><Link to="/#about">{t.aboutUs}</Link></li>
            <li><Link to="/#faq">{t.faq}</Link></li>
          </ul>
        </div>

        <div className="footerCol">
          <h4>{t.contactUs}</h4>
          <p className="footerContactItem"><MapPin size={16} /> {t.location}</p>
          <p className="footerContactItem"><Phone size={16} /> {storeCfg?.phone || '01097905455'}</p>
          <p className="footerContactItem"><Mail size={16} /> info@esraamoments.com</p>
        </div>
      </div>
      <div className="footerBottom">
        <div className="container flex-between">
          <p>© {new Date().getFullYear()} ESRAA Moments. {t.rights}</p>
          <p className="craftedBy">Luxury Custom Event Favors Platform</p>
        </div>
      </div>
    </footer>
  );
}
