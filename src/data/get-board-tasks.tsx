import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { cache } from 'react'

export const getBoardTasks = cache(async (boardId: string) => {
  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({
    where: { userId: user.id, id: boardId },
  })
  if (!board) return null

  const columns = await prisma.column.findMany({
    where: { boardId },
    include: { tasks: true },
  })

  return { columns }
})
