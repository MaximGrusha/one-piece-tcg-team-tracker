'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import './dashboard.css'

import type { Card, Borrow, CardSet, Color, Rarity, ToastState } from '@/components/types'
import { Spinner, Toast } from '@/components/helpers'
import { DashboardHeader } from '@/components/DashboardHeader'
import { CardFilters, ResultsBar } from '@/components/CardFilters'
import { CardTile } from '@/components/CardTile'
import { BorrowModal } from '@/components/BorrowModal'
import { CardModal } from '@/components/CardModal'
import { BorrowHistoryPanel } from '@/components/BorrowHistory'
import { WishlistPanel } from '@/components/WishlistPanel'

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
  const [tab, setTab] = useState<'cards' | 'borrows' | 'wishlist'>('cards')
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cards, setCards] = useState<Card[]>([])
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowsLoading, setBorrowsLoading] = useState(false)

  const [sets, setSets] = useState<CardSet[]>([])
  const [selSetCode, setSelSetCode] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selColors, setSelColors] = useState<Color[]>([])
  const [selRarities, setSelRarities] = useState<Rarity[]>([])
  const [availOnly, setAvailOnly] = useState(false)

  const [borrowTarget, setBorrowTarget] = useState<Card | null>(null)
  const [editTarget, setEditTarget] = useState<Card | null | 'new'>('new' as const)
  const [showCardModal, setShowCardModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [toast, setToast] = useState<ToastState | null>(null)

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type, id: Date.now() })
  }

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
  useEffect(() => {
    fetch('/api/sets').then(r => r.ok ? r.json() : []).then(setSets).catch(() => {})
  }, [])
  useEffect(() => {
    fetch('/api/wishlist').then(r => r.ok ? r.json() : []).then((items: unknown[]) => setWishlistCount(items.length)).catch(() => {})
  }, [])

  const filtered = useMemo(() => cards.filter(card => {
    if (selSetCode && !card.setCode.startsWith(selSetCode + '-') && card.setCode !== selSetCode) return false
    if (search && !card.name.toLowerCase().includes(search.toLowerCase()) && !card.setCode.toLowerCase().includes(search.toLowerCase())) return false
    if (selColors.length > 0 && !selColors.includes(card.color)) return false
    if (selRarities.length > 0 && !selRarities.includes(card.rarity)) return false
    if (availOnly && card.availableQuantity === 0) return false
    return true
  }), [cards, search, selColors, selRarities, availOnly, selSetCode])

  const stats = useMemo(() => {
    const total = cards.reduce((s, c) => s + c.totalQuantity, 0)
    const avail = cards.reduce((s, c) => s + c.availableQuantity, 0)
    const borrowed = total - avail
    const activeBorrows = borrows.filter(b => b.status === 'ACTIVE').length
    const collectionValue = cards.reduce((s, c) => s + (c.marketPrice ?? 0) * c.totalQuantity, 0)
    return { total, avail, borrowed, activeBorrows, uniqueCards: cards.length, collectionValue }
  }, [cards, borrows])

  function toggleColor(c: Color) { setSelColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]) }
  function toggleRarity(r: Rarity) { setSelRarities(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r]) }
  function clearFilters() { setSearch(''); setSelColors([]); setSelRarities([]); setAvailOnly(false); setSelSetCode(null) }

  async function handleReturn(id: string) {
    try {
      const res = await fetch(`/api/borrows/${id}`, { method: 'PUT' })
      if (!res.ok) throw new Error()
      showToast('Картки повернені до архіву')
      fetchBorrows(); fetchCards()
    } catch { showToast('Помилка при поверненні', 'error') }
  }

  async function handleDelete(card: Card) {
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast(`"${card.name}" видалено`)
      setDeleteTarget(null); fetchCards()
    } catch { showToast('Помилка при видаленні', 'error') }
  }

  const hasFilters = !!(search || selColors.length || selRarities.length || availOnly || selSetCode)

  return (
    <div className="app-shell">
      <DashboardHeader
        stats={stats}
        tab={tab}
        setTab={setTab}
        cardsCount={cards.length}
        wishlistCount={wishlistCount}
        isAdmin={isAdmin}
        onAddCard={() => { setEditTarget(null); setShowCardModal(true) }}
      />

      <div className="dash-body">
        {tab === 'cards' && (
          <div className="dash-layout">
            <CardFilters
              search={search} setSearch={setSearch}
              selColors={selColors} toggleColor={toggleColor}
              selRarities={selRarities} toggleRarity={toggleRarity}
              availOnly={availOnly} setAvailOnly={setAvailOnly}
              selSetCode={selSetCode} setSelSetCode={setSelSetCode}
              sets={sets}
              hasFilters={hasFilters} clearFilters={clearFilters}
              filtered={filtered.length} totalCards={cards.length}
              loading={loading} open={filtersOpen}
            />

            <main className="dash-main">
              {/* Mobile: filter toggle */}
              <button
                className={`filter-toggle${hasFilters ? ' has-active' : ''}`}
                onClick={() => setFiltersOpen(v => !v)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Фільтри
                {hasFilters && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-gold)', flexShrink: 0 }} />
                )}
              </button>

              <ResultsBar
                filtered={filtered.length} totalCards={cards.length}
                loading={loading} hasFilters={hasFilters}
                selColors={selColors} selRarities={selRarities}
                availOnly={availOnly} selSetCode={selSetCode}
                toggleColor={toggleColor} toggleRarity={toggleRarity}
                setAvailOnly={setAvailOnly} setSelSetCode={setSelSetCode}
              />

              {loading ? (
                <Spinner />
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  {cards.length === 0 ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 52, height: 52, color: 'var(--text-muted)' }}>
                        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M12 3v18" />
                      </svg>
                      <p>Архів порожній</p>
                      <p style={{ fontSize: 12 }}>
                        {isAdmin ? 'Додайте першу картку або імпортуйте сет' : 'Адмін ще не додав картки'}
                      </p>
                      {isAdmin && (
                        <button className="btn-gold" onClick={() => { setEditTarget(null); setShowCardModal(true) }} style={{ marginTop: 12 }}>
                          + Додати картку
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 44, height: 44, color: 'var(--text-muted)' }}>
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                      <p>Нічого не знайдено</p>
                      <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: 8, fontSize: 12 }}>Скинути фільтри</button>
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

        {tab === 'wishlist' && (
          <WishlistPanel
            isAdmin={isAdmin}
            showToast={showToast}
          />
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
            setShowCardModal(false); setEditTarget(null)
            showToast(editTarget ? 'Картку оновлено' : 'Картку додано до архіву')
            fetchCards()
          }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 360 }}>
            <div className="modal-body" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" style={{ width: 22, height: 22 }}>
                  <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>Видалити картку?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
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

      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}

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
          <button className={`bottom-nav-btn${tab === 'wishlist' ? ' active' : ''}`} onClick={() => setTab('wishlist')} style={tab === 'wishlist' ? { color: '#f87171' } : {}}>
            <div className="bottom-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {wishlistCount > 0 && <span className="bottom-nav-badge" style={{ background: '#dc2626' }}>{wishlistCount}</span>}
            </div>
            Вішліст
          </button>
        </div>
      </nav>
    </div>
  )
}
