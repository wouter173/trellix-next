import { getUserBoards } from '@/data/get-user-boards'
import { validateRequest } from '@/lib/auth/api'
import { ChevronRightIcon, FileTextIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Card } from '../card'
import { AddBoardButton } from './add-board-button'

export default async function Home() {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  return (
    <div className="grid min-h-[calc(100vh-60px)] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="w-full max-w-sm">
        <Card className="min-h-[416px]">
          <div>
            <h1 className="text-lg font-semibold">Hey {user.username}! </h1>
            <p>Take a look at your boards</p>
          </div>
          <Suspense
            fallback={
              <ul className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <li
                    key={i}
                    className="flex h-[42px] w-full animate-pulse items-center justify-between rounded-xl border bg-gray-50 px-3 py-2"
                  />
                ))}
              </ul>
            }
          >
            <BoardList />
          </Suspense>
          <div className="mt-auto">
            <AddBoardButton />
          </div>
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
    <ul className="flex flex-col gap-2">
      {boards.map((board) => (
        <li key={board.id} className="">
          <Link
            className="flex w-full items-center justify-between rounded-xl border px-3 py-2 hover:bg-gray-100 hover:underline"
            href={`/board/${board.id}`}
          >
            <div className="flex items-center gap-2">
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
