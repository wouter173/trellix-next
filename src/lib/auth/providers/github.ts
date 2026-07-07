import { env } from '@/env'
import { GitHub } from 'arctic'

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  env.NODE_ENV === 'production'
    ? 'https://trellix.wouterdb.com/api/auth/github/callback'
    : 'http://localhost:3000/api/auth/github/callback',
)
