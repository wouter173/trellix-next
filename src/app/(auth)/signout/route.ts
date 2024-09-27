import { lucia } from '@/lib/auth/lucia'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const GET = (req: NextRequest) => {
  cookies().set(lucia.createBlankSessionCookie())
  req.nextUrl.pathname = '/signin'

  return NextResponse.redirect(req.nextUrl.toString())
}
