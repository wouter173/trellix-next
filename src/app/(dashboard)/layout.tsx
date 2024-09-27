import { PropsWithChildren } from 'react'
import { Nav } from '../nav'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      {children}
    </>
  )
}
