'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
        router.push(callbackUrl)
      } else {
        setError('Невірний email або пароль')
        setPassword('')
      }
    } catch {
      setError("Помилка з'єднання")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="nav-grid" />

        {mounted && (
          <div className="particles" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  left: `${(i * 5.4 + 3) % 95}%`,
                  animationDelay: `${(i * 0.45) % 9}s`,
                  animationDuration: `${7 + (i * 0.6) % 7}s`,
                  width: i % 3 === 0 ? '3px' : '2px',
                  height: i % 3 === 0 ? '3px' : '2px',
                }}
              />
            ))}
          </div>
        )}

        <div className={`login-card${mounted ? ' login-card--in' : ''}`}>
          <div className="login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v14" />
              <path d="M5 11h5M14 11h5" />
              <path d="M7 20l5 2 5-2" />
            </svg>
          </div>

          <h1 className="login-title">Thousand Seas Archive</h1>
          <p className="login-sub">One Piece TCG · Crew Collection</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 8l10 6 10-6" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="login-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="login-err" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password} className="login-btn">
              {loading ? (
                <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} /> Перевірка...</>
              ) : (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 17, height: 17 }}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>Увійти до Архіву</>
              )}
            </button>
          </form>

          <p className="login-footer">⚔ &nbsp;Тільки для членів екіпажу&nbsp; ⚔</p>
        </div>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-base);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          animation: orbFloat 14s ease-in-out infinite;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
          top: -150px; left: -150px;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(212,160,23,0.04) 0%, transparent 70%);
          top: 50%; left: 60%;
          animation-delay: -9s;
        }
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(25px,-18px) scale(1.04); }
          66%      { transform: translate(-18px,22px) scale(0.97); }
        }
        .nav-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .particle {
          position: absolute;
          bottom: -10px;
          background: var(--gold);
          border-radius: 50%;
          animation: rise linear infinite;
          opacity: 0;
        }
        @keyframes rise {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          8%   { opacity: 0.3; }
          92%  { opacity: 0.15; }
          100% { transform: translateY(-105vh) scale(0.8); opacity: 0; }
        }
        .login-card {
          position: relative;
          z-index: 10;
          background: var(--bg-raised);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid var(--border-strong);
          border-radius: 20px;
          padding: 48px 42px 40px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 8px 50px rgba(0,0,0,0.5), 0 0 60px rgba(251,191,36,0.06);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1);
        }
        .login-card--in { opacity: 1; transform: translateY(0); }
        .login-card::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(140deg, rgba(251,191,36,0.15), transparent 55%, rgba(251,191,36,0.05));
          pointer-events: none;
          z-index: -1;
        }
        .login-icon {
          width: 58px; height: 58px;
          margin: 0 auto 22px;
          color: var(--text-gold);
          background: var(--gold-faint);
          border: 1px solid var(--border-gold);
          border-radius: 15px;
          display: flex; align-items: center; justify-content: center;
        }
        .login-icon svg { width: 30px; height: 30px; }
        .login-title {
          font-family: var(--font-display);
          font-size: 29px;
          color: var(--gold);
          letter-spacing: 0.02em;
          margin: 0 0 7px;
        }
        .login-sub {
          font-family: var(--font-body);
          font-size: 12.5px;
          color: var(--text-muted);
          margin: 0 0 30px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }
        .login-form { display: flex; flex-direction: column; gap: 11px; }
        .field-wrap { position: relative; display: flex; align-items: center; }
        .field-icon {
          position: absolute;
          left: 13px;
          width: 18px; height: 18px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 13px 15px 13px 42px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 11px;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .login-input::placeholder { color: var(--text-muted); }
        .login-input:focus {
          border-color: var(--border-gold);
          background: var(--bg-surface);
          box-shadow: 0 0 0 3px rgba(251,191,36,0.1);
        }
        .login-err {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 13px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 9px;
          color: var(--crimson);
          font-family: var(--font-body);
          font-size: 13px;
          text-align: left;
          animation: shake 0.28s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-4px); }
          75%     { transform: translateX(4px); }
        }
        .login-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px 24px;
          background: linear-gradient(135deg, var(--text-gold-dim), var(--gold));
          border: none;
          border-radius: 11px;
          color: var(--bg-base);
          font-family: var(--font-display);
          font-size: 16px;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
          box-shadow: 0 3px 18px rgba(251,191,36,0.2);
          margin-top: 3px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 28px rgba(251,191,36,0.3);
          filter: brightness(1.08);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.48; cursor: not-allowed; }
        .login-footer {
          margin: 26px 0 0;
          font-family: var(--font-body);
          font-size: 11.5px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }
      `}</style>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
