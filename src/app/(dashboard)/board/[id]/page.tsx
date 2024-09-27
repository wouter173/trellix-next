import { getBoardCards } from '@/data/get-board-cards'
import { validateRequest } from '@/lib/auth/api'
import { notFound, redirect } from 'next/navigation'
import { Board } from './board'

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  const result = await getBoardCards(params.id)
  if (!result) return notFound()

  return (
    <div className="w-full py-20">
      <Board columns={result.columns} boardId={params.id} />
    </div>
  )
}
