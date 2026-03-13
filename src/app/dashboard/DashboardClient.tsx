'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import './dashboard.css'

import type { Card, Borrow, Color, Rarity, ToastState } from '@/components/types'
import { Spinner, Toast } from '@/components/helpers'
import { DashboardHeader } from '@/components/DashboardHeader'
import { CardFilters, ResultsBar } from '@/components/CardFilters'
import { CardTile } from '@/components/CardTile'
import { BorrowModal } from '@/components/BorrowModal'
import { CardModal } from '@/components/CardModal'
import { BorrowHistoryPanel } from '@/components/BorrowHistory'

export default function DashboardClient({
  userRole,
  userId: _userId,
  displayName,
}: {
  userRole: 'ADMIN' | 'MEMBER'
  userId: string
  displayName: string
}) {
  const isAdmin = userRole === 'ADMIN'
  const [tab, setTab] = useState<'cards' | 'borrows'>('cards')
  const [cards, setCards] = useState<Card[]>([])
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowsLoading, setBorrowsLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selColors, setSelColors] = useState<Color[]>([])
  const [selRarities, setSelRarities] = useState<Rarity[]>([])
  const [availOnly, setAvailOnly] = useState(false)

  // Modals
  const [borrowTarget, setBorrowTarget] = useState<Card | null>(null)
  const [editTarget, setEditTarget] = useState<Card | null | 'new'>('new' as const)
  const [showCardModal, setShowCardModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [toast, setToast] = useState<ToastState | null>(null)

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  // Fetch
  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cards')
      if (res.ok) setCards(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBorrows = useCallback(async () => {
    setBorrowsLoading(true)
    try {
      const res = await fetch('/api/borrows')
      if (res.ok) setBorrows(await res.json())
    } finally {
      setBorrowsLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])
  useEffect(() => { if (tab === 'borrows') fetchBorrows() }, [tab, fetchBorrows])

  // Filtered cards
  const filtered = useMemo(() => {
    return cards.filter(card => {
      if (search && !card.name.toLowerCase().includes(search.toLowerCase()) && !card.setCode.toLowerCase().includes(search.toLowerCase())) return false
      if (selColors.length > 0 && !selColors.includes(card.color)) return false
      if (selRarities.length > 0 && !selRarities.includes(card.rarity)) return false
      if (availOnly && card.availableQuantity === 0) return false
      return true
    })
  }, [cards, search, selColors, selRarities, availOnly])

  // Stats
  const stats = useMemo(() => {
    const total = cards.reduce((s, c) => s + c.totalQuantity, 0)
    const avail = cards.reduce((s, c) => s + c.availableQuantity, 0)
    const borrowed = total - avail
    const activeBorrows = borrows.filter(b => b.status === 'ACTIVE').length
    const collectionValue = cards.reduce((s, c) => s + (c.marketPrice ?? 0) * c.totalQuantity, 0)
    return { total, avail, borrowed, activeBorrows, uniqueCards: cards.length, collectionValue }
  }, [cards, borrows])

  function toggleColor(c: Color) {
    setSelColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }
  function toggleRarity(r: Rarity) {
    setSelRarities(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }
  function clearFilters() {
    setSearch('')
    setSelColors([])
    setSelRarities([])
    setAvailOnly(false)
  }

  async function handleReturn(id: string) {
    try {
      const res = await fetch(`/api/borrows/${id}`, { method: 'PUT' })
      if (!res.ok) throw new Error()
      showToast('Картки повернені до архіву')
      fetchBorrows()
      fetchCards()
    } catch {
      showToast('Помилка при поверненні', 'error')
    }
  }

  async function handleDelete(card: Card) {
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast(`"${card.name}" видалено`)
      setDeleteTarget(null)
      fetchCards()
    } catch {
      showToast('Помилка при видаленні', 'error')
    }
  }

  const hasFilters = search || selColors.length || selRarities.length || availOnly

  return (
    <>
      <DashboardHeader
        stats={stats}
        tab={tab}
        setTab={setTab}
        cardsCount={cards.length}
        isAdmin={isAdmin}
        onAddCard={() => { setEditTarget(null); setShowCardModal(true) }}
      />

      <div className="dash-body">
        {tab === 'cards' && (
          <div className="dash-layout">
            <CardFilters
              search={search}
              setSearch={setSearch}
              selColors={selColors}
              toggleColor={toggleColor}
              selRarities={selRarities}
              toggleRarity={toggleRarity}
              availOnly={availOnly}
              setAvailOnly={setAvailOnly}
              hasFilters={!!hasFilters}
              clearFilters={clearFilters}
              filtered={filtered.length}
              totalCards={cards.length}
              loading={loading}
              open={filtersOpen}
            />

            <main className="dash-main">
              {/* Mobile filter toggle */}
              <button
                className={`filter-toggle-btn${hasFilters ? ' has-filters' : ''}`}
                onClick={() => setFiltersOpen(v => !v)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                {filtersOpen ? 'Сховати фільтри' : 'Фільтри'}
                {hasFilters && !filtersOpen && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-gold)', flexShrink: 0 }} />
                )}
              </button>

              <ResultsBar
                filtered={filtered.length}
                totalCards={cards.length}
                loading={loading}
                hasFilters={!!hasFilters}
                selColors={selColors}
                selRarities={selRarities}
                availOnly={availOnly}
                toggleColor={toggleColor}
                toggleRarity={toggleRarity}
                setAvailOnly={setAvailOnly}
              />

              {loading ? (
                <Spinner />
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  {cards.length === 0 ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 56, height: 56, color: 'var(--text-muted)' }}>
                        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M12 3v18" />
                      </svg>
                      <p>Архів порожній</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {isAdmin ? 'Додайте першу картку до колекції' : 'Адмін ще не додав картки'}
                      </p>
                      {isAdmin && (
                        <button className="btn-gold" onClick={() => { setEditTarget(null); setShowCardModal(true) }} style={{ marginTop: 12 }}>
                          + Додати картку
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'var(--text-muted)' }}>
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6M11 8v6" />
                      </svg>
                      <p>Нічого не знайдено</p>
                      <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: 8, fontSize: 13 }}>Скинути фільтри</button>
                    </>
                  )}
                </div>
              ) : (
                <div className="card-grid">
                  {filtered.map(card => (
                    <CardTile
                      key={card.id}
                      card={card}
                      onBorrow={c => setBorrowTarget(c)}
                      onEdit={c => { setEditTarget(c); setShowCardModal(true) }}
                      onDelete={c => setDeleteTarget(c)}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {tab === 'borrows' && (
          <div className="borrows-panel">
            <BorrowHistoryPanel borrows={borrows} onReturn={handleReturn} loading={borrowsLoading} />
          </div>
        )}
      </div>

      {/* Modals */}
      {borrowTarget && (
        <BorrowModal
          card={borrowTarget}
          onClose={() => setBorrowTarget(null)}
          onSuccess={() => {
            setBorrowTarget(null)
            showToast(`"${borrowTarget.name}" успішно позичена`)
            fetchCards()
          }}
          displayName={displayName}
        />
      )}

      {showCardModal && (
        <CardModal
          card={editTarget instanceof Object && editTarget !== null ? editTarget as Card : null}
          onClose={() => { setShowCardModal(false); setEditTarget(null) }}
          onSuccess={() => {
            setShowCardModal(false)
            setEditTarget(null)
            showToast(editTarget ? 'Картку оновлено' : 'Картку додано до архіву')
            fetchCards()
          }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-body" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" style={{ width: 24, height: 24 }}>
                  <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Видалити картку?</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                «{deleteTarget.name}» буде видалено з архіву назавжди.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Скасувати</button>
                <button className="btn-danger" onClick={() => handleDelete(deleteTarget)} style={{ flex: 1, justifyContent: 'center' }}>Видалити</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast toast={toast} onDone={() => setToast(null)} />
      )}

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button className={`bottom-nav-btn${tab === 'cards' ? ' active' : ''}`} onClick={() => setTab('cards')}>
            <div className="bottom-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            Колекція
          </button>
          <button className={`bottom-nav-btn${tab === 'borrows' ? ' active' : ''}`} onClick={() => setTab('borrows')}>
            <div className="bottom-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
              </svg>
              {stats.activeBorrows > 0 && <span className="bottom-nav-badge">{stats.activeBorrows}</span>}
            </div>
            Позики
          </button>
          {isAdmin && (
            <button className="bottom-nav-btn" onClick={() => { setEditTarget(null); setShowCardModal(true) }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Додати
            </button>
          )}
          <button className="bottom-nav-btn" onClick={() => window.location.href = isAdmin ? '/admin/users' : '/dashboard'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isAdmin ? (
                <>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                </>
              ) : (
                <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
              )}
            </svg>
            {isAdmin ? 'Команда' : 'Інфо'}
          </button>
        </div>
      </nav>
    </>
  )
}
