import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_POSTGRES_URL: z.string().url(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },
  client: {},
  experimental__runtimeEnv: {},
})
