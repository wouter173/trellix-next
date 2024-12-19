import { lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const Nav = () => {
  return (
    <nav className="sticky top-0 flex w-full items-center justify-between bg-gray-100 px-20 py-4 shadow-sm dark:border-b dark:border-b-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">Trellix Next</h1>
        <Link
          prefetch={true}
          href="/"
          className="rounded-lg px-2 py-1 text-gray-800 transition-all hover:bg-gray-200 active:scale-95 dark:text-gray-50 dark:hover:bg-zinc-800"
        >
          Boards
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <form
          action={async () => {
            'use server'
            const cookieStore = await cookies()
            cookieStore.set(lucia.createBlankSessionCookie())
            redirect('/')
          }}
        >
          <button className="rounded-lg px-2 py-1 text-gray-800 transition-all hover:bg-gray-200 active:scale-95 dark:text-gray-50 dark:hover:bg-zinc-800">
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}
