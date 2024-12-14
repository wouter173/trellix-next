export default function Loading() {
  return (
    <div className="w-full pt-10">
      <div className="px-20 pb-4">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100/70 dark:bg-zinc-800/70"></div>
      </div>
      <div className="flex gap-2 overflow-x-hidden px-20 pb-20">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex h-32 w-80 shrink-0 animate-pulse flex-col gap-2 rounded-xl bg-gray-100 dark:bg-zinc-800/70"></div>
        ))}
      </div>
    </div>
  )
}
