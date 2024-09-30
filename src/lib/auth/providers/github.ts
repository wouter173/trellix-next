import { env } from '@/env'
import { GitHub } from 'arctic'

export const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, {
  redirectURI:
    env.NODE_ENV === 'production'
      ? 'https://trellix-next.vercel.app/api/auth/callback/github'
      : 'http://localhost:3000/api/auth/callback/github',
})
