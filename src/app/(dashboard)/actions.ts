'use server'

import { getUserBoards } from '@/data/get-user-boards'
import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { generateRandomColorName } from '@/lib/utils'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const addBoard = async () => {
  const { user } = await validateRequest()
  if (!user) return { error: 'Unauthorized' }

  const boards = await getUserBoards()
  if (boards && boards.length >= 5) {
    return { error: 'You can only have 5 boards' }
  }

  const boardId = nanoid()
  const columnId = nanoid()

  await prisma.$transaction([
    prisma.board.create({
      data: { id: boardId, name: `${generateRandomColorName()} Board`, userId: user.id },
    }),
    prisma.column.createMany({
      data: [
        { id: columnId, boardId, name: 'To Do', order: 0 },
        { id: nanoid(), boardId, name: 'Edit me by pressing on me!', order: 1 },
      ],
    }),
    prisma.card.createMany({
      data: [
        { id: nanoid(), columnId, name: 'Welcome to your new board!', order: 0 },
        { id: nanoid(), columnId, name: 'Click on add column to create a new column', order: 1 },
        { id: nanoid(), columnId, name: 'Drag and drop to reorder cards', order: 2 },
      ],
    }),
  ])

  revalidatePath('/')
  return redirect(`/board/${boardId}`)
}
