'use server'

import { env } from '@/env'
import { github } from '@/lib/auth/providers/github'
import { generateState } from 'arctic'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function githubLoginAction() {
  const state = generateState()
  const url = await github.createAuthorizationURL(state, [])

  const cookieStore = await cookies()
  cookieStore.set('github_oauth_state', state, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })
  redirect(url.toString())
}
