'use client'

export function AdminLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <header className="nav-blur" style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border-faint)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 24px', height: 60, maxWidth: 1100, margin: '0 auto',
        }}>
          <a href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text-muted)', textDecoration: 'none',
            fontSize: 13, fontFamily: 'var(--font-body)',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Колекція
          </a>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 20,
              color: 'var(--text-gold)', margin: 0, lineHeight: 1.2,
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '1px 0 0', fontFamily: 'var(--font-body)' }}>
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>
        {children}
      </main>
    </div>
  )
}
