'use client'

import { useState, useEffect, useCallback } from 'react'

type LogEntry = {
  id: string
  createdAt: string
  action: string
  details: string | null
  userId: string | null
  user: { displayName: string; email: string } | null
}

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  CARD_CREATED: { label: 'Картку додано', icon: '+', color: '#22c55e' },
  CARD_UPDATED: { label: 'Картку оновлено', icon: '✎', color: 'var(--text-gold)' },
  CARD_DELETED: { label: 'Картку видалено', icon: '✕', color: 'var(--crimson)' },
  BORROW_CREATED: { label: 'Нова позика', icon: '→', color: '#3b82f6' },
  BORROW_RETURNED: { label: 'Повернення', icon: '←', color: '#22c55e' },
  USER_CREATED: { label: 'Користувача створено', icon: '+', color: '#22c55e' },
  USER_UPDATED: { label: 'Користувача оновлено', icon: '✎', color: 'var(--text-gold)' },
  USER_DELETED: { label: 'Користувача видалено', icon: '✕', color: 'var(--crimson)' },
  PRICES_REFRESHED: { label: 'Ціни оновлено', icon: '$', color: '#22c55e' },
  SET_IMPORTED: { label: 'Сет імпортовано', icon: '↓', color: '#3b82f6' },
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'щойно'
  if (diffMin < 60) return `${diffMin} хв тому`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} год тому`
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ActivityClient() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/activity?limit=100')
      if (res.ok) setLogs(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <a href="/dashboard" className="btn-ghost" style={{ fontSize: 13, textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Назад
        </a>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-gold)', margin: 0 }}>
            Журнал активності
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0', letterSpacing: '0.08em' }}>
            ОСТАННІ ДІЇ В СИСТЕМІ
          </p>
        </div>
        <button className="btn-ghost" onClick={fetchLogs} style={{ fontSize: 12 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Оновити
        </button>
      </div>

      <div className="pirate-frame" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Журнал порожній
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((log, idx) => {
              const meta = ACTION_LABELS[log.action] || { label: log.action, icon: '•', color: 'var(--text-muted)' }
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '14px 20px',
                    borderBottom: idx < logs.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: meta.color, fontSize: 13, fontWeight: 700, flexShrink: 0,
                    fontFamily: 'var(--font-body)',
                  }}>
                    {meta.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {meta.label}
                      </span>
                      {log.user && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                          {log.user.displayName}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        {fmtTime(log.createdAt)}
                      </span>
                    </div>
                    {log.details && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
