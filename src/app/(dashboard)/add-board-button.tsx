'use client'

import { SpinnerButton } from '@/components/button'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { addBoard } from './actions'

export const AddBoardButton = () => {
  const [pending, startTransition] = useTransition()

  const onClick = async () => {
    startTransition(async () => {
      const { error } = await addBoard()
      if (error) {
        toast.error(error)
      }
    })
  }

  return (
    <SpinnerButton type="button" disabled={pending} pending={pending} onClick={onClick}>
      Add board
    </SpinnerButton>
  )
}
