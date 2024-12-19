'use client'
import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'
import { AnimatePresence, motion } from 'motion/react'
import { useFormStatus } from 'react-dom'

export const GithubSigninButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending}>
      Sign in with GitHub
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
