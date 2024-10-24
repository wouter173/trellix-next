import { lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const cookieStore = await cookies()
  cookieStore.set(lucia.createBlankSessionCookie())
  req.nextUrl.pathname = '/signin'

  return NextResponse.redirect(req.nextUrl.toString())
}
