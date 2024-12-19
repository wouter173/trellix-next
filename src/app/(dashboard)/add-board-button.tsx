'use client'

import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'
import { AnimatePresence, motion } from 'motion/react'
import { startTransition, useActionState } from 'react'
import { toast } from 'sonner'
import { addBoard } from './actions'

export const AddBoardButton = () => {
  const [, addBoardAction, pending] = useActionState(async () => {
    const { error } = await addBoard()
    if (error) toast.error(error)
  }, null)

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(() => addBoardAction())
      }}
    >
      Add board
      <AnimatePresence>
        {pending && (
          <motion.div
            animate={{ width: 'auto', opacity: 1, scale: 1 }}
            initial={{ width: '0px', opacity: 0, scale: 0.95 }}
            exit={{ width: '0px', opacity: 0, scale: 0.95 }}
            transition={{ ease: 'easeInOut', duration: 0.1 }}
            className="overflow-hidden"
          >
            <Spinner />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
