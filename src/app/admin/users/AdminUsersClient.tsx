'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Toast } from '@/components/helpers'
import type { ToastState } from '@/components/types'

type User = { id: string; email: string; displayName: string; role: 'ADMIN' | 'MEMBER'; createdAt: string }
type CreateForm = { email: string; password: string; displayName: string; role: 'ADMIN' | 'MEMBER' }
const DEFAULT_FORM: CreateForm = { email: '', password: '', displayName: '', role: 'MEMBER' }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminUsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateForm>(DEFAULT_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) setUsers(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  function showMsg(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true); setFormError('')
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Помилка') }
      setShowModal(false); setForm(DEFAULT_FORM)
      showMsg(`Користувача ${form.displayName} створено`)
      fetchUsers()
    } catch (err) { setFormError(err instanceof Error ? err.message : 'Помилка') }
    finally { setFormLoading(false) }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Видалити ${user.displayName}?`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Помилка') }
      showMsg(`${user.displayName} видалено`)
      fetchUsers()
    } catch (err) { showMsg(err instanceof Error ? err.message : 'Помилка', 'error') }
  }

  async function handleRoleToggle(user: User) {
    const newRole = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Помилка') }
      showMsg(`${user.displayName}: роль → ${newRole}`)
      fetchUsers()
    } catch (err) { showMsg(err instanceof Error ? err.message : 'Помилка', 'error') }
  }

  return (
    <AdminLayout
      title="Команда"
      subtitle={`${users.length} ${users.length === 1 ? 'учасник' : users.length < 5 ? 'учасники' : 'учасників'}`}
      actions={
        <button className="btn-gold" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Додати
        </button>
      }
    >
      {/* Users list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 15 }}>
          Немає користувачів
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(user => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              transition: 'border-color 0.15s',
            }}>
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: user.role === 'ADMIN'
                  ? 'linear-gradient(135deg, #92400e, #d97706)'
                  : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-surface))',
                border: `2px solid ${user.role === 'ADMIN' ? 'rgba(240,180,41,0.4)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 16,
                color: user.role === 'ADMIN' ? '#fff8e8' : 'var(--text-secondary)',
              }}>
                {user.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.displayName}
                  </span>
                  {user.id === currentUserId && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '1px 7px', borderRadius: 99, border: '1px solid var(--border)' }}>
                      ви
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
              </div>

              {/* Role badge + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(user.createdAt)}</span>
                <button
                  className="pill-badge"
                  onClick={() => user.id !== currentUserId && handleRoleToggle(user)}
                  style={{
                    cursor: user.id === currentUserId ? 'default' : 'pointer',
                    background: user.role === 'ADMIN' ? 'rgba(240,180,41,0.12)' : 'var(--bg-elevated)',
                    color: user.role === 'ADMIN' ? 'var(--text-gold)' : 'var(--text-secondary)',
                    border: `1px solid ${user.role === 'ADMIN' ? 'var(--border-gold)' : 'var(--border)'}`,
                    fontSize: 11, padding: '4px 10px',
                    transition: 'all 0.15s',
                  }}
                  title={user.id === currentUserId ? 'Не можна змінити власну роль' : `Змінити на ${user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'}`}
                >
                  {user.role === 'ADMIN' ? '⚓ ADMIN' : 'MEMBER'}
                </button>
                <button
                  className="btn-icon danger"
                  onClick={() => handleDelete(user)}
                  disabled={user.id === currentUserId}
                  title={user.id === currentUserId ? 'Не можна видалити себе' : 'Видалити'}
                  style={{ opacity: user.id === currentUserId ? 0.3 : 1 }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                    <path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Новий учасник</h2>
                <p className="modal-sub">Додати до команди</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate} className="modal-form">
                <div className="field-group">
                  <label className="field-label">Ім&apos;я / Нікнейм</label>
                  <input type="text" placeholder="Luffy" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className="field-input" required autoFocus />
                </div>
                <div className="field-group">
                  <label className="field-label">Email</label>
                  <input type="email" placeholder="luffy@crew.local" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="field-input" required />
                </div>
                <div className="field-group">
                  <label className="field-label">Пароль (мін. 8 символів)</label>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="field-input" required minLength={8} />
                </div>
                <div className="field-group">
                  <label className="field-label">Роль</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'MEMBER' }))} className="field-input">
                    <option value="MEMBER">MEMBER — звичайний учасник</option>
                    <option value="ADMIN">ADMIN — адміністратор</option>
                  </select>
                </div>
                {formError && <div className="form-error">{formError}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Скасувати</button>
                  <button type="submit" className="btn-gold" disabled={formLoading} style={{ flex: 2 }}>
                    {formLoading ? <><span className="spinner" style={{ width: 15, height: 15 }} />Створення...</> : 'Створити'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
    </AdminLayout>
  )
}
