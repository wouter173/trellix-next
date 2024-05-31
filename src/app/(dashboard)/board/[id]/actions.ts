'use server'

import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { nanoid } from '@/lib/nanoid'
import { revalidatePath } from 'next/cache'

import { z } from 'zod'

export const addColumnAction = async (actionData: { boardId: string; name: string }) => {
  const data = z
    .object({
      boardId: z.string(),
      name: z.string(),
    })
    .parse(actionData)

  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({
    where: { userId: user.id, id: data.boardId },
  })

  if (!board) return null

  await prisma.column.create({
    data: {
      id: nanoid(),
      name: data.name,
      boardId: data.boardId,
    },
  })

  revalidatePath(`/board/${data.boardId}`)

  return { success: true }
}

export const removeColumnAction = async (actionData: { boardId: string; columnId: string }) => {
  const data = z
    .object({
      boardId: z.string(),
      columnId: z.string(),
    })
    .parse(actionData)

  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({
    where: { userId: user.id, id: data.boardId },
  })
  if (!board) return null

  await prisma.column.delete({
    where: { id: data.columnId },
  })

  revalidatePath(`/board/${data.boardId}`)

  return { success: true }
}
