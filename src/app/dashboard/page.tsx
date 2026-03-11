import { getSessionFromCookies } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSessionFromCookies()
  if (!session) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #c9a456 0%, #b8873c 50%, #a67530 100%)' }}>
      <DashboardClient />
    </div>
  )
}
