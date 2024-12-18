import { getBoardCards } from '@/data/get-board-cards'
import { validateRequest } from '@/lib/auth/api'
import { notFound, redirect } from 'next/navigation'
import { Board } from './board'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  const result = await getBoardCards(params.id)
  if (!result) return notFound()

  return (
    <div className="w-full pt-10">
      <div className="px-20 pb-4">
        <h2 className="text-2xl font-semibold">{result.board.name}</h2>
      </div>
      <Board columns={result.columns} boardId={params.id} />
    </div>
  )
}
