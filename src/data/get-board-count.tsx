import { prisma } from '@/lib/db/prisma'
import { unstable_cache as cache } from 'next/cache'

export const getBoardCount = cache(
  async () => {
    const count = await prisma.board.count()
    return count
  },
  [],
  {
    tags: ['board-count'],
    revalidate: 60 * 60,
  },
)
