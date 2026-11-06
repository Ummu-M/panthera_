import { ReactNode } from 'react'
import { theme } from '@/lib/theme'

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="admin-page-header" style={{ borderBottom: `1px solid ${theme.border}`, paddingBottom: 20 }}>
      {eyebrow ? <div style={{ color: theme.gold600, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{eyebrow}</div> : null}
      <h1 style={{ color: theme.text, fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, margin: 0 }}>{title}</h1>
      {description ? <p style={{ color: theme.muted, fontSize: 14, margin: '6px 0 0' }}>{description}</p> : null}
    </header>
  )
}

export function StatCard({ label, value, primary = false }: { label: string; value: ReactNode; primary?: boolean }) {
  return (
    <article
      style={{
        background: '#ffffff',
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        gridColumn: primary ? 'span 2' : undefined,
        padding: primary ? 24 : 18
      }}
    >
      <div style={{ color: theme.muted, fontSize: 13 }}>{label}</div>
      <div style={{ color: theme.text, fontSize: primary ? 34 : 24, fontVariantNumeric: 'tabular-nums', marginTop: 8 }}>{value}</div>
    </article>
  )
}

export type AdminColumn<T> = {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
  render: (row: T) => ReactNode
}

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  sort,
  direction,
  onSort
}: {
  rows: T[]
  columns: AdminColumn<T>[]
  getRowKey: (row: T) => string
  sort: string
  direction: 'asc' | 'desc'
  onSort: (key: string) => void
}) {
  return (
    <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
      <table className="admin-data-table" style={{ borderCollapse: 'collapse', color: theme.text, minWidth: 680, width: '100%' }}>
        <thead>
          <tr>
            {columns.map((column) => {
              const isSorted = sort === column.key
              const ariaSort = !column.sortable ? undefined : isSorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'
              return (
                <th key={column.key} scope="col" aria-sort={ariaSort} style={{ textAlign: column.align || 'left' }}>
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      style={{ background: 'transparent', border: 0, color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 }}
                    >
                      {column.label}{isSorted ? (direction === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : column.label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => <td key={column.key} style={{ textAlign: column.align || 'left' }}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ padding: 28, textAlign: 'center' }}>
      <h3 style={{ color: theme.text, fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ color: theme.muted, fontSize: 14, margin: 0 }}>{children}</p>
      {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
    </div>
  )
}
