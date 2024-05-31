import { PrismaClient } from '@prisma/client'
import { env } from '@/env'

const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
})

export { prisma }
