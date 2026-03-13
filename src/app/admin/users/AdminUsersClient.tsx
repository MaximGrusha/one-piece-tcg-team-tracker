'use client'

import { useState, useEffect, useCallback } from 'react'

type User = {
  id: string
  email: string
  displayName: string
  role: 'ADMIN' | 'MEMBER'
  createdAt: string
}

type CreateForm = {
  email: string
  password: string
  displayName: string
  role: 'ADMIN' | 'MEMBER'
}

const DEFAULT_FORM: CreateForm = {
  email: '',
  password: '',
  displayName: '',
  role: 'MEMBER',
}

export function AdminUsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateForm>(DEFAULT_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function showMsg(msg: string, ok = true) {
    setToast({ msg, ok })
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Помилка')
      }
      setShowModal(false)
      setForm(DEFAULT_FORM)
      showMsg(`Користувача ${form.displayName} створено`)
      fetchUsers()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Помилка')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Видалити ${user.displayName} (${user.email})?`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Помилка')
      }
      showMsg(`${user.displayName} видалено`)
      fetchUsers()
    } catch (err) {
      showMsg(err instanceof Error ? err.message : 'Помилка видалення', false)
    }
  }

  async function handleRoleToggle(user: User) {
    const newRole = user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Помилка')
      }
      showMsg(`${user.displayName}: роль змінено на ${newRole}`)
      fetchUsers()
    } catch (err) {
      showMsg(err instanceof Error ? err.message : 'Помилка', false)
    }
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <a
            href="/dashboard"
            className="btn-ghost"
            style={{ fontSize: 13, textDecoration: 'none' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Назад
          </a>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-gold)', margin: 0 }}>
              Управління командою
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0', letterSpacing: '0.08em' }}>
              АДМІНІСТРУВАННЯ · {users.length} ЧЛЕНІВ
            </p>
          </div>
          <button className="btn-gold" onClick={() => setShowModal(true)} style={{ fontSize: 13 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Додати
          </button>
        </div>

        {/* Table */}
        <div className="pirate-frame" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Немає користувачів
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Ім\'я', 'Email', 'Роль', 'Дата', ''].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-body)',
                        background: 'var(--bg-surface)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
                      background: idx % 2 === 0 ? 'var(--bg-surface)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--text-gold-dim), var(--gold))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--bg-base)', fontFamily: 'var(--font-display)', fontSize: 14,
                          flexShrink: 0,
                        }}>
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>
                          {user.displayName}
                          {user.id === currentUserId && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>(ви)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        className="pill-badge"
                        onClick={() => user.id !== currentUserId && handleRoleToggle(user)}
                        style={{
                          cursor: user.id === currentUserId ? 'default' : 'pointer',
                          background: user.role === 'ADMIN' ? 'var(--gold-faint)' : 'var(--bg-surface)',
                          color: user.role === 'ADMIN' ? 'var(--text-gold)' : 'var(--text-secondary)',
                          border: `1px solid ${user.role === 'ADMIN' ? 'var(--border-gold)' : 'var(--border)'}`,
                          transition: 'all 0.15s',
                        }}
                        title={user.id === currentUserId ? 'Не можна змінити власну роль' : `Змінити роль на ${user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'}`}
                      >
                        {user.role === 'ADMIN' ? '⚓ ADMIN' : 'MEMBER'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                      {fmtDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(user)}
                        disabled={user.id === currentUserId}
                        style={{ fontSize: 12 }}
                        title={user.id === currentUserId ? 'Не можна видалити себе' : 'Видалити'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                          <path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2" />
                        </svg>
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Новий користувач</h2>
                <p className="modal-sub">Додати члена команди</p>
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
                  <input
                    type="text"
                    placeholder="Luffy"
                    value={form.displayName}
                    onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    className="field-input"
                    required
                    autoFocus
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    placeholder="luffy@strawhats.sea"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="field-input"
                    required
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Пароль (мін. 8 символів)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="field-input"
                    required
                    minLength={8}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Роль</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'MEMBER' }))}
                    className="field-input"
                  >
                    <option value="MEMBER">MEMBER — звичайний учасник</option>
                    <option value="ADMIN">ADMIN — адміністратор</option>
                  </select>
                </div>

                {formError && (
                  <div className="form-error" style={{
                    padding: '10px 13px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 9,
                    color: 'var(--crimson)',
                    fontSize: 13,
                    fontFamily: 'var(--font-body)',
                  }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                    Скасувати
                  </button>
                  <button type="submit" className="btn-gold" disabled={formLoading} style={{ flex: 2 }}>
                    {formLoading
                      ? <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} />Створення...</>
                      : 'Створити'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          {toast.ok ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      <style>{`
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 24px 24px 0;
        }
        .modal-title { font-family: var(--font-display); font-size: 20px; color: var(--text-primary); margin: 0; }
        .modal-sub { font-size: 12px; color: var(--text-muted); margin: 4px 0 0; font-family: var(--font-body); }
        .modal-close {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 4px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .modal-close:hover { color: var(--text-primary); background: var(--gold-faint); }
        .modal-body { padding: 20px 24px 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 14px; }
        .field-group { display: flex; flex-direction: column; gap: 5px; }
      `}</style>
    </>
  )
}
