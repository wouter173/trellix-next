import { getBoardCount } from '@/data/get-board-count'

import { NextResponse } from 'next/server'

export const GET = async () => {
  return NextResponse.json({ boards: await getBoardCount() })
}
