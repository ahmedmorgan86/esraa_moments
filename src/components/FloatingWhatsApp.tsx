import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { getLocal } from '../lib';

export function FloatingWhatsApp() {
  const wa = getLocal<any | null>('em-settings', null)?.whatsapp || '201097905455';
  return (
    <motion.a
      className="waFloat"
      href={`https://wa.me/${wa}?text=${encodeURIComponent('مرحباً ESRAA Moments، عايزة أستفسر عن التوزيعات 🌸')}`}
      target="_blank" rel="noreferrer" aria-label="WhatsApp"
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.1 }} whileTap={{ scale: .92 }}
    >
      <MessageCircle size={26} />
    </motion.a>
  );
}
