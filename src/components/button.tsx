import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export const Button = ({ className, children, ...props }: ComponentProps<'button'>) => {
  return (
    <button
      className={cn(
        'group flex w-min items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 px-4 py-1.5 font-medium transition-all enabled:hover:outline enabled:hover:outline-2 enabled:focus-visible:outline enabled:focus-visible:outline-2 enabled:active:scale-95 disabled:opacity-85',
        'border-gray-900 bg-gray-900 text-white outline-gray-900 enabled:hover:border-white enabled:hover:bg-gray-950 enabled:focus-visible:border-white',
        'dark:border-[2.5px] dark:border-gray-100 dark:bg-gray-100 dark:text-black dark:outline-gray-100 dark:enabled:hover:border-gray-900 dark:enabled:hover:bg-white dark:enabled:focus-visible:border-gray-900',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
