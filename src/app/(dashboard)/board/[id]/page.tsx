import { getBoardTasks } from '@/data/get-board-tasks'
import { validateRequest } from '@/lib/auth/api'
import { notFound, redirect } from 'next/navigation'
import { Board } from './board'

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  const result = await getBoardTasks(params.id)
  if (!result) return notFound()

  return (
    <div className="h-screen w-full">
      <Board columns={result.columns} boardId={params.id} />
    </div>
  )
}
