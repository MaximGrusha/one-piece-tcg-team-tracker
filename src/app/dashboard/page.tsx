import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DashboardClient
        userRole={session.user.role}
        userId={session.user.id}
        displayName={session.user.displayName}
      />
    </div>
  )
}
