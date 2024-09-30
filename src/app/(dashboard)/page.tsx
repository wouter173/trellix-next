import { getUserBoards } from '@/data/get-user-boards'
import { validateRequest } from '@/lib/auth/api'
import { prisma } from '@/lib/db/prisma'
import { ChevronRightIcon, FileTextIcon } from 'lucide-react'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Card } from '../card'

export default async function Home() {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  return (
    <div className="grid min-h-[calc(100vh-60px)] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="w-full max-w-sm">
        <Card>
          <div>
            <h1 className="text-lg font-semibold">Hey {user.username}! </h1>
            <p>Take a look at your boards</p>
          </div>
          <Suspense fallback={'loading...'}>
            <BoardList />
            <AddBoardButton />
          </Suspense>
        </Card>
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
    <ul className="flex flex-col gap-4">
      {boards.map((board) => (
        <li key={board.id} className="">
          <Link
            className="flex w-full items-center justify-between rounded-xl border px-3 py-2 hover:bg-gray-100 hover:underline"
            href={`/board/${board.id}`}
          >
            <div className="flex gap-2">
              <FileTextIcon className="size-5" />
              {board.name}
            </div>
            <ChevronRightIcon className="size-5" />
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
