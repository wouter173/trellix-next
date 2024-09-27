import { PropsWithChildren } from 'react'

export const Card = ({ children }: PropsWithChildren) => {
  return <div className="flex w-full flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6">{children}</div>
}
