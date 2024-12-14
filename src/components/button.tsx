import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ComponentProps } from 'react'
import { Spinner } from './spinner'

export const Button = ({ className, children, ...props }: ComponentProps<'button'>) => {
  return (
    <button
      className={cn(
        'group flex w-min items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-gray-900 bg-gray-900 px-4 py-1.5 font-medium text-white outline-gray-900 transition-all enabled:hover:border-white enabled:hover:bg-gray-950 enabled:hover:outline enabled:hover:outline-2 enabled:focus-visible:border-white enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:active:scale-95 disabled:opacity-85',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const SpinnerButton = ({ pending, className, children, ...props }: ComponentProps<'button'> & { pending?: boolean }) => {
  return (
    <button
      className={cn(
        'group flex w-min items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-gray-900 bg-gray-900 px-4 py-1.5 font-medium text-white outline-gray-900 transition-all enabled:hover:border-white enabled:hover:bg-gray-950 enabled:hover:outline enabled:hover:outline-2 enabled:focus-visible:border-white enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:active:scale-95 disabled:opacity-85',
        className,
      )}
      {...props}
    >
      {children}
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
    </button>
  )
}
