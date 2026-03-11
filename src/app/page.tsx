'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Невірний пароль екіпажу')
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
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Пароль екіпажу"
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

            <button type="submit" disabled={loading || !password} className="login-btn">
              {loading ? (
                <><span className="spinner" style={{ borderTopColor: '#1c1107', borderColor: 'rgba(28,17,7,0.25)' }} /> Перевірка...</>
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
          background: linear-gradient(160deg, #c9a456 0%, #b8873c 40%, #a67530 100%);
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
          background: radial-gradient(circle, rgba(255,220,100,0.2) 0%, transparent 70%);
          top: -150px; left: -150px;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(180,83,9,0.1) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(120,60,20,0.08) 0%, transparent 70%);
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
            linear-gradient(rgba(120,60,20,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120,60,20,0.06) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
        .particles { position: absolute; inset: 0; pointer-events: none; }
        .particle {
          position: absolute;
          bottom: -10px;
          background: #d97706;
          border-radius: 50%;
          animation: rise linear infinite;
          opacity: 0;
        }
        @keyframes rise {
          0%   { transform: translateY(0) scale(0); opacity: 0; }
          8%   { opacity: 0.4; }
          92%  { opacity: 0.2; }
          100% { transform: translateY(-105vh) scale(0.8); opacity: 0; }
        }
        .login-card {
          position: relative;
          z-index: 10;
          background: rgba(248,232,192,0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(180,100,20,0.22);
          border-radius: 20px;
          padding: 48px 42px 40px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          box-shadow: 0 2px 0 rgba(255,255,255,0.7) inset, 0 8px 50px rgba(60,30,5,0.35), 0 2px 8px rgba(120,60,10,0.1);
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
          background: linear-gradient(140deg, rgba(251,191,36,0.25), transparent 55%, rgba(180,100,20,0.1));
          pointer-events: none;
          z-index: -1;
        }
        .login-icon {
          width: 58px; height: 58px;
          margin: 0 auto 22px;
          color: #b45309;
          background: rgba(251,191,36,0.18);
          border: 1px solid rgba(180,100,20,0.25);
          border-radius: 15px;
          display: flex; align-items: center; justify-content: center;
        }
        .login-icon svg { width: 30px; height: 30px; }
        .login-title {
          font-family: var(--font-display);
          font-size: 29px;
          color: #4a1e06;
          letter-spacing: 0.02em;
          margin: 0 0 7px;
        }
        .login-sub {
          font-family: var(--font-body);
          font-size: 12.5px;
          color: rgba(40,18,3,0.5);
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
          color: rgba(180,100,20,0.5);
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          padding: 13px 15px 13px 42px;
          background: rgba(248,232,192,0.7);
          border: 1px solid rgba(180,100,20,0.22);
          border-radius: 11px;
          color: #1e0f03;
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .login-input::placeholder { color: rgba(100,50,10,0.35); }
        .login-input:focus {
          border-color: rgba(180,100,20,0.55);
          background: rgba(248,236,204,0.95);
          box-shadow: 0 0 0 3px rgba(251,191,36,0.15);
        }
        .login-err {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 13px;
          background: rgba(185,28,28,0.08);
          border: 1px solid rgba(185,28,28,0.22);
          border-radius: 9px;
          color: #991b1b;
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
          background: linear-gradient(135deg, #92400e, #b45309, #d97706);
          border: none;
          border-radius: 11px;
          color: #fff8e8;
          font-family: var(--font-display);
          font-size: 16px;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, filter 0.18s;
          box-shadow: 0 3px 18px rgba(180,83,9,0.35);
          margin-top: 3px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 7px 28px rgba(180,83,9,0.45);
          filter: brightness(1.08);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.48; cursor: not-allowed; }
        .login-footer {
          margin: 26px 0 0;
          font-family: var(--font-body);
          font-size: 11.5px;
          color: rgba(100,50,10,0.3);
          letter-spacing: 0.1em;
        }
      `}</style>
    </>
  )
}
