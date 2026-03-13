import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #c9a456 0%, #b8873c 50%, #a67530 100%)' }}>
      <DashboardClient
        userRole={session.user.role}
        userId={session.user.id}
        displayName={session.user.displayName}
      />
    </div>
  )
}
