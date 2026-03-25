// src/pages/AuthPage.jsx
// ============================================================
// AuthPage – Animated Login / Register with particle grid,
// glassmorphism card, and smooth tab transitions.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Animated particle grid canvas ──────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H, particles;

    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 130;
    const MOUSE = { x: -999, y: -999 };

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const mkParticle = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
    });

    const init = () => {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, mkParticle);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(20,184,166,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw + move particles
      particles.forEach((p) => {
        // Mouse repulsion
        const mdx = p.x - MOUSE.x;
        const mdy = p.y - MOUSE.y;
        const md  = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 100) {
          p.vx += (mdx / md) * 0.05;
          p.vy += (mdy / md) * 0.05;
        }
        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.2) { p.vx *= 0.95; p.vy *= 0.95; }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20,184,166,0.55)';
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      MOUSE.x = e.clientX - rect.left;
      MOUSE.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', () => { resize(); });
    canvas.addEventListener('mousemove', onMouseMove);

    init();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
};

// ── Eye icon for password toggle ───────────────────────────
const EyeIcon = ({ open }) => open
  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>;

// ── Floating label input ────────────────────────────────────
const FloatInput = ({ id, label, type = 'text', value, onChange, error, autoComplete, rightSlot }) => (
  <div className="relative">
    <input
      id={id} type={type} value={value} onChange={onChange}
      autoComplete={autoComplete}
      placeholder=" "
      className={`
        peer w-full px-4 pt-6 pb-2 rounded-xl
        bg-white/5 border text-slate-100 text-sm placeholder-transparent
        focus:outline-none focus:ring-2 transition-all duration-200
        ${error
          ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
          : 'border-white/10 focus:ring-brand-500/30 focus:border-brand-500/60'}
        ${rightSlot ? 'pr-11' : ''}
      `}
    />
    <label
      htmlFor={id}
      className={`
        absolute left-4 top-4 text-sm transition-all duration-200 pointer-events-none
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm
        peer-focus:top-2 peer-focus:text-xs peer-focus:text-brand-400
        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs
        ${value ? 'top-2 text-xs text-brand-400/70' : 'text-slate-500'}
      `}
    >
      {label}
    </label>
    {rightSlot && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
    )}
    {error && <p className="mt-1 text-xs text-red-400 pl-1">{error}</p>}
  </div>
);

// ── Strength bar for password ───────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-brand-400'];
  return (
    <div className="flex items-center gap-2 mt-1.5 px-1">
      <div className="flex gap-1 flex-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <span className={`text-xs font-mono ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-amber-400' : score === 3 ? 'text-yellow-400' : 'text-brand-400'}`}>
        {labels[score]}
      </span>
    </div>
  );
};

// ── Main AuthPage Component ─────────────────────────────────
const AuthPage = () => {
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPw, setShowPw]   = useState(false);
  const [animDir, setAnimDir] = useState(1); // 1 = slide right, -1 = slide left

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const switchMode = (next) => {
    setAnimDir(next === 'register' ? 1 : -1);
    setMode(next);
    setErrors({});
    setForm({ name: '', email: '', password: '' });
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim())    errs.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email.';
    if (!form.password)        errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'At least 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-4">

      {/* ── Animated particle background ── */}
      <ParticleCanvas />

      {/* ── Radial glow blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Grid overlay texture ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* ── Auth Card ── */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/30 mb-4 backdrop-blur-sm"
            style={{ boxShadow: '0 0 40px rgba(20,184,166,0.2)' }}>
            <svg className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9 2 2 4-4" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-100">
            Task<span className="text-brand-400">Flow</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Your productivity command centre</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/8 overflow-hidden"
          style={{
            background: 'rgba(15,23,42,0.75)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

          {/* Tab switcher */}
          <div className="flex border-b border-white/6">
            {['login','register'].map((tab) => (
              <button
                key={tab}
                onClick={() => switchMode(tab)}
                className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all duration-200 capitalize relative
                  ${mode === tab ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
                {mode === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-brand-400 rounded-full"
                    style={{ boxShadow: '0 0 8px rgba(20,184,166,0.6)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Name (register only) */}
              <div className={`overflow-hidden transition-all duration-300 ${isRegister ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <FloatInput
                  id="name" label="Full Name"
                  value={form.name} onChange={set('name')}
                  error={errors.name} autoComplete="name"
                />
              </div>

              {/* Email */}
              <FloatInput
                id="email" label="Email Address" type="email"
                value={form.email} onChange={set('email')}
                error={errors.email} autoComplete="email"
              />

              {/* Password */}
              <div>
                <FloatInput
                  id="password" label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  error={errors.password}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  rightSlot={
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                      <EyeIcon open={showPw} />
                    </button>
                  }
                />
                {isRegister && <PasswordStrength password={form.password} />}
              </div>

              {/* Forgot password (login only) */}
              {!isRegister && (
                <div className="flex justify-end -mt-1">
                  <button type="button" className="text-xs text-slate-500 hover:text-brand-400 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-slate-950
                           transition-all duration-200 relative overflow-hidden mt-2
                           disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  boxShadow: submitting || loading ? 'none' : '0 0 24px rgba(20,184,166,0.35), 0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                {/* Shimmer effect */}
                {!submitting && !loading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12
                                   translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-700" />
                )}
                {(submitting || loading)
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                      {isRegister ? 'Creating account…' : 'Signing in…'}
                    </span>
                  : isRegister ? 'Create Account' : 'Sign In'
                }
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-slate-600">OR</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            Demo credentials box
            <div className="rounded-xl border border-brand-500/15 bg-brand-500/5 p-4">
              <p className="text-xs font-semibold text-brand-400/70 uppercase tracking-widest mb-2">
                Demo Credentials
              </p>
              <div className="space-y-1">
                {[
                  ['Email',    'alice@example.com'],
                  ['Password', 'password'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{k}</span>
                    <code className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{v}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode switch link */}
            <p className="text-center text-sm text-slate-600 mt-6">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => switchMode(isRegister ? 'login' : 'register')}
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                {isRegister ? 'Sign in' : 'Create one free'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-700 mt-6 font-mono">
          TaskFlow · React + Express + MySQL
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
