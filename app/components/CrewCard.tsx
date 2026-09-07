'use client'

import { CSSProperties, ReactNode } from 'react'
import { shieldClip, theme } from '@/lib/theme'

const C = theme

type CrewCardProps = {
  children: ReactNode
  accent?: boolean
  urgent?: boolean
  style?: CSSProperties
  className?: string
}

export function CrewCard({ children, accent = false, urgent = false, style, className }: CrewCardProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        background: C.forest850,
        border: `1px solid ${urgent ? C.danger : accent ? C.gold500 : C.border}`,
        borderRadius: 6,
        boxShadow: urgent ? '0 10px 24px rgba(214,69,69,0.14)' : '0 8px 22px rgba(18,36,53,0.07)',
        overflow: 'hidden',
        ...style
      }}
    >
      {(accent || urgent) && <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 44, height: 7, background: urgent ? C.danger : C.gold500, clipPath: shieldClip }} />}
      {children}
    </div>
  )
}

export function InitialsBadge({ name, prominent = false }: { name: string; prominent?: boolean }) {
  const initials = String(name || 'Panthera').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const size = prominent ? 58 : 44
  return (
    <div aria-label={`${name} initials`} style={{ width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'rgba(40,127,186,0.12)', color: C.gold600, border: `2px solid ${C.gold500}`, clipPath: shieldClip, fontFamily: 'var(--font-mono)', fontSize: prominent ? 17 : 13, fontWeight: 500 }}>
      {initials}
    </div>
  )
}

export function CrewEmptyState({ children }: { children: ReactNode }) {
  return <div style={{ borderLeft: `3px solid ${C.gold500}`, background: 'rgba(40,127,186,0.07)', padding: '14px 16px', color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>
}
