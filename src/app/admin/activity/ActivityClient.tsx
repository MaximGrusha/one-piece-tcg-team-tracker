'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/AdminLayout'

type LogEntry = {
  id: string; createdAt: string; action: string
  details: string | null; userId: string | null
  user: { displayName: string; email: string } | null
}

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  CARD_CREATED:    { label: 'Картку додано',        color: '#34d399', icon: <path d="M12 5v14M5 12h14" /> },
  CARD_UPDATED:    { label: 'Картку оновлено',       color: '#60a5fa', icon: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /> },
  CARD_DELETED:    { label: 'Картку видалено',       color: '#f43f5e', icon: <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /> },
  BORROW_CREATED:  { label: 'Нова позика',           color: '#f0b429', icon: <><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" /></> },
  BORROW_RETURNED: { label: 'Повернення',            color: '#34d399', icon: <path d="M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1" /> },
  USER_CREATED:    { label: 'Користувача створено',  color: '#34d399', icon: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></> },
  USER_UPDATED:    { label: 'Роль змінено',          color: '#60a5fa', icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></> },
  USER_DELETED:    { label: 'Користувача видалено',  color: '#f43f5e', icon: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 5l5 5m0-5l-5 5" /></> },
  PRICES_REFRESHED:{ label: 'Ціни оновлено',         color: '#34d399', icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /> },
  SET_IMPORTED:    { label: 'Сет імпортовано',       color: '#60a5fa', icon: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></> },
}

function fmtTime(iso: string) {
  const d = new Date(iso), now = new Date()
  const min = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (min < 1) return 'щойно'
  if (min < 60) return `${min} хв тому`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} год тому`
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
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return (
    <AdminLayout
      title="Журнал активності"
      subtitle="Останні дії в системі"
      actions={
        <button className="btn-ghost" onClick={fetchLogs}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Оновити
        </button>
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
          Журнал порожній
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {logs.map((log, idx) => {
            const meta = ACTION_META[log.action] ?? { label: log.action, color: 'var(--text-muted)', icon: <circle cx="12" cy="12" r="2" /> }
            return (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 20px',
                borderBottom: idx < logs.length - 1 ? '1px solid var(--border-faint)' : 'none',
              }}>
                {/* Icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: `${meta.color}18`,
                  border: `1px solid ${meta.color}38`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
                    {meta.icon}
                  </svg>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                      {meta.label}
                    </span>
                    {log.user && (
                      <span style={{ fontSize: 12, color: 'var(--text-gold)', fontFamily: 'var(--font-body)' }}>
                        {log.user.displayName}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {fmtTime(log.createdAt)}
                    </span>
                  </div>
                  {log.details && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
