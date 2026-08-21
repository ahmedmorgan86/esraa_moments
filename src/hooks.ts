import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { seed } from './data';
import type { Product } from './data';
import { getLocal } from './lib';

export function useProducts() {
  const [items, setItems] = useState<Product[]>(seed);
  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from('products').select('id,name,price,stock,image_url,description,is_featured,categories(name)').eq('is_active', true);
      if (active && data?.length) setItems(data.map((p: any) => ({
        id: p.id, name: p.name, category: p.categories?.name || 'مناسبات خاصة',
        price: Number(p.price), stock: p.stock, image: p.image_url || seed[0].image, desc: p.description || '', featured: !!p.is_featured
      })));
    })();
    return () => { active = false };
  }, []);
  return items;
}

export function useLocalStorage<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(() => getLocal(key, fallback));
  useEffect(() => { localStorage.setItem(key, JSON.stringify(val)); }, [key, val]);
  return [val, setVal];
}

export function useScrollShadow() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}
