import { uiLang } from './i18n';

export const money = (n: number) => uiLang === 'en' ? `EGP ${Number(n || 0).toLocaleString('en-US')}` : `${Number(n || 0).toLocaleString('ar-EG')} ج.م`;

export const getLocal = <T,>(k: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fallback } catch { return fallback } };

export const ease: [number, number, number, number] = [.22, 1, .36, 1];
