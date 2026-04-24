'use client'

import { signOut } from 'next-auth/react'

type Stats = {
  uniqueCards: number
  total: number
  borrowed: number
  activeBorrows: number
  collectionValue: number
}

export function DashboardHeader({
  stats,
  tab,
  setTab,
  cardsCount,
  isAdmin,
  onAddCard,
}: {
  stats: Stats
  tab: 'cards' | 'borrows'
  setTab: (tab: 'cards' | 'borrows') => void
  cardsCount: number
  isAdmin: boolean
  onAddCard: () => void
}) {
  return (
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

        {/* Actions */}
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
          <button
            className="btn-ghost"
            style={{ fontSize: 12, padding: '7px 10px' }}
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Вийти"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
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
            <span className="tab-count" style={{ background: 'rgba(245,200,66,0.18)', color: 'var(--gold)' }}>
              {stats.activeBorrows}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
