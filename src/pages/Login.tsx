import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { AnimateScale, pageVariants } from '../components/motion';
import { supabase } from '../lib/supabase';
import { translations } from '../i18n';

export function LoginPage({ t }: { t: typeof translations.ar }) {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!supabase) { localStorage.setItem('em-admin-demo', '1'); nav('/admin'); return; }
    const r = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (r.error) { setError(r.error.message); return; }
    if (mode === 'signup') {
      setError(t.signupNotice);
      setMode('login');
      return;
    }
    const userId = r.data.user?.id;
    const { data: roles, error: roleErr } = await supabase.from('user_roles').select('role').eq('user_id', userId).in('role', ['admin', 'staff']);
    if (roleErr || !roles || roles.length === 0) {
      await supabase.auth.signOut();
      setError(t.noRoleError);
      return;
    }
    nav('/admin');
  };

  return (
    <motion.section className="section page authPage" {...pageVariants}>
      <AnimateScale>
        <div className="authCard">
          <motion.div className="authIcon" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <LogIn size={28} />
          </motion.div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>{mode === 'login' ? t.loginTitle : t.signupTitle}</h1>
          <form onSubmit={submit}>
            <label>
              <span className="labelIcon"><Mail size={14} /></span>
              {t.emailLabel}
              <input type="email" required placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label>
              <span className="labelIcon"><Lock size={14} /></span>
              {t.passwordLabel}
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            <motion.button className="btn primary full btnLg" whileHover={{ y: -2 }} whileTap={{ scale: .96 }}>
              <LogIn size={18} /> {mode === 'login' ? t.loginBtn : t.signupBtn}
            </motion.button>
          </form>
          {error && <p className="authError">{error}</p>}
          <motion.button
            className="textButton"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: .98 }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? t.noAccount : t.haveAccount}
          </motion.button>
        </div>
      </AnimateScale>
    </motion.section>
  );
}
