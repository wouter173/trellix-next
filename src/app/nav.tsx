import Link from 'next/link'

export const Nav = () => {
  return (
    <nav className="sticky top-0 flex w-full items-center justify-between bg-gray-100 px-20 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">Trellix Next</h1>
        <Link href="/" className="text-gray-800">
          Boards
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/signout" className="text-gray-800">
          Sign out
        </Link>
      </div>
    </nav>
  )
}
