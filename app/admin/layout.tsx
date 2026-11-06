import { ReactNode } from 'react'
import { AdminToastProvider } from '../components/admin/AdminToastProvider'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminToastProvider>{children}</AdminToastProvider>
}
