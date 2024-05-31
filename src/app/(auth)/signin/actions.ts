'use server'

import { generateState } from 'arctic'
import { github } from '@/lib/auth/providers/github'
import { cookies } from 'next/headers'
import { env } from '@/env'
import { redirect } from 'next/navigation'

export async function githubLoginAction() {
  const state = generateState()
  const url = await github.createAuthorizationURL(state)

  cookies().set('github_oauth_state', state, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  redirect(url.toString())
}
