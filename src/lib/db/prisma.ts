import { env } from '@/env'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
})

export { prisma }
