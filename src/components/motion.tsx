import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ease } from '../lib';

export function AnimateScroll({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string; [k: string]: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 50, filter: 'blur(8px)' }}
      transition={{ duration: .7, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimateScale({ children, delay = 0, className = '', ...props }: { children: React.ReactNode; delay?: number; className?: string; [k: string]: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: .85, rotate: -2 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: .85, rotate: -2 }}
      transition={{ duration: .6, delay, ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ visible: { transition: { staggerChildren: .12 } } }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [k: string]: any }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: .96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: .5, ease } }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: .5, ease } as const },
  exit: { opacity: 0, y: -20, filter: 'blur(6px)', transition: { duration: .3 } }
};
