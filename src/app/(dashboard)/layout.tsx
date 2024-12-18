import { Nav } from '@/components/nav'
import { lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  // Check if the user has a session cookie to make sure no ui flash is shown to logged out users
  const authSession = (await cookies()).get(lucia.sessionCookieName)
  if (!authSession?.value) redirect('/signin')

  return (
    <>
      <Nav />
      {children}
    </>
  )
}
