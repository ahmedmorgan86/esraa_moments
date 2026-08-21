import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { translations } from '../i18n';
import { getLocal } from '../lib';

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .58.05.85.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

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
              <TikTokIcon />
            </motion.a>
          </div>
        </div>

        <div className="footerCol">
          <h4>{t.quickLinks}</h4>
          <ul>
            <li><Link to="/custom">{t.designStudio}</Link></li>
            <li><Link to="/track">{t.track}</Link></li>
            <li><Link to="/#about">{t.aboutUs}</Link></li>
            <li><Link to="/#faq">{t.faq}</Link></li>
            <li><Link to="/login">{t.adminLogin}</Link></li>
          </ul>
        </div>

        <div className="footerCol">
          <h4>{t.contactUs}</h4>
          <p className="footerContactItem"><MapPin size={16} /> {t.location}</p>
          <p className="footerContactItem"><Phone size={16} /> {storeCfg?.phone || '01097905455'}</p>
          <p className="footerContactItem"><Mail size={16} /> esraamomentsstore@gmail.com</p>
        </div>
      </div>
      <div className="footerBottom">
        <div className="container flex-between">
          <p>© {new Date().getFullYear()} ESRAA Moments. {t.rights}</p>
        </div>
      </div>
    </footer>
  );
}
