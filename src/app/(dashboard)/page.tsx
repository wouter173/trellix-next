import { getUserBoards } from '@/data/get-user-boards'
import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function Home() {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <div>
          <h1 className="text-lg font-semibold">Hi {user.username}</h1>
          <Suspense fallback={'loading...'}>
            <BoardList />
            <AddBoardButton />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

const BoardList = async () => {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  const boards = await getUserBoards()
  if (!boards || boards.length === 0) return 'no boards...'

  return (
    <ul>
      {boards.map((board) => (
        <li key={board.id}>
          <Link className="hover:underline" href={`/board/${board.id}`}>
            {board.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

const AddBoardButton = async () => {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  const addBoard = async () => {
    'use server'

    await prisma.board.create({
      data: {
        id: nanoid(),
        name: 'New Board',
        userId: user.id,
      },
    })

    revalidatePath('/')
  }

  return (
    <form action={addBoard}>
      <button>Add board</button>
    </form>
  )
}
