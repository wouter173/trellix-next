import { validateRequest } from '@/lib/auth/api'
import { nanoid } from '@/lib/nanoid'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { user } = await validateRequest()
  if (!user) redirect('/signin')

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">Hi {user.username}</main>
      {nanoid()}
    </div>
  )
}
