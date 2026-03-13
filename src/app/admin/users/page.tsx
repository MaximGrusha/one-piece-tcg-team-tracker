import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminUsersClient } from './AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #c9a456 0%, #b8873c 50%, #a67530 100%)' }}
    >
      <AdminUsersClient currentUserId={session.user.id} />
    </div>
  )
}
