import { prisma } from '@/lib/prisma'

export async function logActivity(action: string, userId?: string | null, details?: string) {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        userId: userId ?? null,
        details: details ?? null,
      },
    })
  } catch {
    // non-critical — don't break the main flow
  }
}
