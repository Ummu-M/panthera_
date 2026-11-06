'use client'

import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'

export function AdminSearchInput({ value, onSearch }: { value: string; onSearch: (value: string) => void }) {
  const [input, setInput] = useState(value)

  useEffect(() => setInput(value), [value])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (input !== value) onSearch(input.trim())
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [input, onSearch, value])

  return (
    <label style={{ color: theme.muted, display: 'grid', flex: '1 1 240px', fontSize: 13, gap: 6 }}>
      Search treasury
      <input
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Purpose, category, recorder, or amount"
        style={{ border: `1px solid ${theme.border}`, borderRadius: 8, color: theme.text, minHeight: 42, padding: '9px 12px', width: '100%' }}
      />
    </label>
  )
}
