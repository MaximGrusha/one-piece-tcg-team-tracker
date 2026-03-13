import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import ImportClient from './ImportClient'

export default async function ImportPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if ((session.user as { role: string }).role !== 'ADMIN') redirect('/dashboard')

  return <ImportClient />
}
