import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminUsersClient } from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <AdminUsersClient currentUserId={session.user.id} />
    </div>
  )
}
