'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'

type Stats = {
  uniqueCards: number
  total: number
  borrowed: number
  activeBorrows: number
  collectionValue: number
}

type Tab = 'cards' | 'borrows' | 'wishlist'

export function DashboardHeader({
  stats,
  tab,
  setTab,
  cardsCount,
  wishlistCount,
  isAdmin,
  onAddCard,
}: {
  stats: Stats
  tab: Tab
  setTab: (tab: Tab) => void
  cardsCount: number
  wishlistCount: number
  isAdmin: boolean
  onAddCard: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="top-nav nav-blur">
        <div className="top-nav-inner">
          {/* Logo */}
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-gold)" strokeWidth="1.5" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v14M5 11h5M14 11h5M7 20l5 2 5-2" />
              </svg>
            </div>
            <div className="nav-logo-text">
              <span className="nav-logo-label">Thousand Seas</span>
              <span className="nav-logo-title">Crew Collection</span>
            </div>
          </div>

          {/* Stats — desktop only */}
          <div className="nav-stats">
            <div className="stat-chip">
              <span className="stat-chip-val">{stats.uniqueCards}</span>
              <span className="stat-chip-lbl">Унікальних</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-val">{stats.total}</span>
              <span className="stat-chip-lbl">Всього</span>
            </div>
            {stats.borrowed > 0 && (
              <div className="stat-chip" style={{ borderColor: 'rgba(245,200,66,0.3)' }}>
                <span className="stat-chip-val" style={{ color: '#fbbf24' }}>{stats.borrowed}</span>
                <span className="stat-chip-lbl">Позичено</span>
              </div>
            )}
            {stats.collectionValue > 0 && (
              <div className="stat-chip">
                <span className="stat-chip-val" style={{ color: '#4ade80', fontSize: 15 }}>${stats.collectionValue.toFixed(0)}</span>
                <span className="stat-chip-lbl">Вартість</span>
              </div>
            )}
          </div>

          {/* Actions — desktop */}
          <div className="nav-actions">
            {isAdmin && (
              <>
                <button className="btn-gold" onClick={onAddCard} style={{ fontSize: 12, padding: '7px 14px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 13, height: 13 }}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Додати
                </button>
                <a href="/admin/import" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none', padding: '7px 12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Імпорт
                </a>
                <a href="/admin/users" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none', padding: '7px 12px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  Команда
                </a>
                <a href="/admin/activity" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none', padding: '7px 10px' }} title="Журнал">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                    <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              </>
            )}
            <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 10px' }} onClick={() => signOut({ callbackUrl: '/login' })} title="Вийти">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>

          {/* Mobile: add button + burger */}
          {isAdmin && (
            <button className="btn-gold nav-add-mobile" onClick={onAddCard} style={{ fontSize: 12, padding: '7px 12px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
          <button className="nav-burger" onClick={() => setMenuOpen(true)} aria-label="Меню">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs-bar">
          <button className={`tab-btn${tab === 'cards' ? ' active' : ''}`} onClick={() => setTab('cards')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            Колекція
            <span className="tab-count">{cardsCount}</span>
          </button>
          <button className={`tab-btn${tab === 'borrows' ? ' active' : ''}`} onClick={() => setTab('borrows')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
            </svg>
            Позики
            {stats.activeBorrows > 0 && (
              <span className="tab-count" style={{ background: 'rgba(245,200,66,0.18)', color: 'var(--gold)' }}>{stats.activeBorrows}</span>
            )}
          </button>
          <button className={`tab-btn${tab === 'wishlist' ? ' active' : ''}`} onClick={() => setTab('wishlist')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            Вішліст
            {wishlistCount > 0 && <span className="tab-count" style={{ background: 'rgba(244,63,94,0.15)', color: '#f87171' }}>{wishlistCount}</span>}
          </button>
        </div>
      </header>

      {/* Mobile burger menu */}
      {menuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
          <nav className="mobile-menu">
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Меню</span>
              <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mobile-menu-links">
              <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Статистика</div>
              <div style={{ display: 'flex', gap: 8, padding: '4px 12px 12px', flexWrap: 'wrap' }}>
                <div className="stat-chip" style={{ flex: 1, minWidth: 70 }}>
                  <span className="stat-chip-val">{stats.uniqueCards}</span>
                  <span className="stat-chip-lbl">Унікальних</span>
                </div>
                <div className="stat-chip" style={{ flex: 1, minWidth: 70 }}>
                  <span className="stat-chip-val">{stats.total}</span>
                  <span className="stat-chip-lbl">Всього</span>
                </div>
                {stats.collectionValue > 0 && (
                  <div className="stat-chip" style={{ flex: 1, minWidth: 70 }}>
                    <span className="stat-chip-val" style={{ color: '#4ade80', fontSize: 14 }}>${stats.collectionValue.toFixed(0)}</span>
                    <span className="stat-chip-lbl">Вартість</span>
                  </div>
                )}
              </div>
              {isAdmin && (
                <>
                  <div className="mobile-menu-divider" />
                  <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Адмін</div>
                  <a href="/admin/import" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Імпорт карток
                  </a>
                  <a href="/admin/users" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                    Команда
                  </a>
                  <a href="/admin/activity" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                      <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                    </svg>
                    Журнал активності
                  </a>
                </>
              )}
              <div className="mobile-menu-divider" />
              <button className="mobile-menu-link danger" onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/login' }) }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Вийти
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
