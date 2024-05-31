import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { cache } from 'react'

export const getUserBoards = cache(async () => {
  const { user } = await validateRequest()
  if (!user) return null

  return await prisma.board.findMany({
    where: { userId: user.id },
  })
})
