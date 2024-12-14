import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

export const Card = ({ children, className }: PropsWithChildren & { className?: string }) => {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900',
        className,
      )}
    >
      {children}
    </div>
  )
}
