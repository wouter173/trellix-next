import { prisma } from '@/lib/db/prisma'

export default async function Home() {
  const users = await prisma.user.findMany()

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-sans sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">{JSON.stringify(users)}</main>
    </div>
  )
}
