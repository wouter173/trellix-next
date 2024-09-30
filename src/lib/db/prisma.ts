import { env } from '@/env'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
})

export { prisma }
