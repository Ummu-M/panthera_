import { theme } from '@/lib/theme'

export default function Loading() {
  return (
    <main className="app-loading">
      <div className="app-loading-content" role="status" aria-live="polite">
        <span className="app-loading-indicator" aria-hidden="true" />
        <span className="app-loading-name">Panthera Rover Crew</span>
        <span className="app-loading-message">Loading your crew space</span>
      </div>
    </main>
  )
}