import { getBoardCards } from '@/data/get-board-cards'
import { validateRequest } from '@/lib/auth/api'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Board } from './board'

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  return (
    <div className="w-full pt-10">
      <Suspense
        fallback={
          <>
            <div className="px-20 pb-4">
              <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100/70"></div>
            </div>
            <div className="flex gap-2 overflow-x-hidden px-20 pb-20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex h-32 w-80 shrink-0 animate-pulse flex-col gap-2 rounded-xl bg-gray-100/70"></div>
              ))}
            </div>
          </>
        }
      >
        <BoardLoader id={params.id} />
      </Suspense>
    </div>
  )
}

const BoardLoader = async ({ id }: { id: string }) => {
  const result = await getBoardCards(id)
  if (!result) return notFound()

  return (
    <>
      <div className="px-20 pb-4">
        <h2 className="text-2xl font-semibold">{result.board.name}</h2>
      </div>
      <Board columns={result.columns} boardId={id} />
    </>
  )
}
