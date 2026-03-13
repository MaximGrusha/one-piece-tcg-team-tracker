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
    <header className="dash-header nav-blur">
      <div className="dash-header-inner">
        <div className="dash-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
            <circle cx="12" cy="5" r="2" /><path d="M12 7v14" /><path d="M5 11h5M14 11h5" /><path d="M7 20l5 2 5-2" />
          </svg>
          <div>
            <p className="dash-logo-label">Thousand Seas Archive</p>
            <h1 className="dash-logo-title">Crew Collection</h1>
          </div>
        </div>

        <div className="dash-stats">
          <div className="stat-chip">
            <span className="stat-chip-val">{stats.uniqueCards}</span>
            <span className="stat-chip-lbl">Унікальних</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-val">{stats.total}</span>
            <span className="stat-chip-lbl">Всього</span>
          </div>
          <div className="stat-chip" style={{ borderColor: stats.borrowed > 0 ? 'var(--border-gold)' : undefined }}>
            <span className="stat-chip-val" style={{ color: stats.borrowed > 0 ? 'var(--text-gold)' : undefined }}>{stats.borrowed}</span>
            <span className="stat-chip-lbl">Позичено</span>
          </div>
          {stats.collectionValue > 0 && (
            <div className="stat-chip">
              <span className="stat-chip-val" style={{ color: '#22c55e', fontSize: 16 }}>${stats.collectionValue.toFixed(0)}</span>
              <span className="stat-chip-lbl">Вартість</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAdmin && (
            <>
              <button className="btn-gold" onClick={onAddCard} style={{ fontSize: 13 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Додати
              </button>
              <a href="/admin/import" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Імпорт
              </a>
              <a href="/admin/users" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                Команда
              </a>
              <a href="/admin/activity" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                </svg>
                Журнал
              </a>
            </>
          )}
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: 12 }}
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Вийти
          </button>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab${tab === 'cards' ? ' dash-tab--active' : ''}`} onClick={() => setTab('cards')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
            <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
          </svg>
          Колекція
          <span className="tab-badge">{cardsCount}</span>
        </button>
        <button className={`dash-tab${tab === 'borrows' ? ' dash-tab--active' : ''}`} onClick={() => setTab('borrows')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
            <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
          </svg>
          Позики
          {stats.borrowed > 0 && <span className="tab-badge" style={{ background: 'var(--text-gold-dim)' }}>{stats.activeBorrows}</span>}
        </button>
      </div>
    </header>
  )
}
