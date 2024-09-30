'use server'

import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { nanoid } from '@/lib/nanoid'
import { revalidatePath } from 'next/cache'

import { z } from 'zod'

export const addColumnAction = async (actionData: { boardId: string; name: string; order: number }) => {
  const data = z
    .object({
      boardId: z.string(),
      name: z.string(),
      order: z.number(),
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
      order: data.order,
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

export const addCardAction = async (actionData: { boardId: string; columnId: string; name: string; order: number }) => {
  const data = z
    .object({
      boardId: z.string(),
      columnId: z.string(),
      name: z.string(),
      order: z.number(),
    })
    .parse(actionData)

  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({
    where: { userId: user.id, id: data.boardId },
  })
  if (!board) return null

  const column = await prisma.column.findFirst({
    where: { id: data.columnId },
  })
  if (!column) return null

  await prisma.card.create({
    data: {
      id: nanoid(),
      name: data.name,
      columnId: data.columnId,
      order: data.order,
    },
  })

  revalidatePath(`/board/${data.boardId}`)

  return { success: true }
}

export const moveCardAction = async (actionData: { boardId: string; cardId: string; toColumnId: string; order: number }) => {
  const data = z
    .object({
      boardId: z.string(),
      cardId: z.string(),
      toColumnId: z.string(),
      order: z.number(),
    })
    .parse(actionData)

  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({ where: { userId: user.id, id: data.boardId } })
  if (!board) return null

  await prisma.card.update({
    where: { id: data.cardId },
    data: {
      columnId: data.toColumnId,
      order: data.order,
    },
  })

  revalidatePath(`/board/${data.boardId}`)

  return { success: true }
}

export const updateColumnNameAction = async (data: { boardId: string; columnId: string; name: string }) => {
  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({ where: { userId: user.id, id: data.boardId } })
  if (!board) return null

  await prisma.column.update({
    where: { id: data.columnId },
    data: { name: data.name },
  })

  revalidatePath(`/board/${data.boardId}`)

  return { success: true }
}

export const deleteCardAction = async (data: { boardId: string; cardId: string }) => {
  const { user } = await validateRequest()
  if (!user) return null

  const board = await prisma.board.findFirst({ where: { userId: user.id, id: data.boardId } })
  if (!board) return null

  await prisma.card.delete({
    where: { id: data.cardId },
  })

  revalidatePath(`/board/${data.boardId}`)

  return { success: true }
}
