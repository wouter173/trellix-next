'use client'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Trash2Icon } from 'lucide-react'
import { ComponentProps, DragEvent, Fragment, RefObject, useRef, useState } from 'react'
import { useOptimisticColumns } from './use-optimistic-columns'

export const Board = (props: {
  boardId: string
  columns: { order: number; name: string; id: string; cards: { id: string; columnId: string; name: string; order: number }[] }[]
}) => {
  const { columns, addCard, addColumn, moveCard, removeCard, removeColumn, updateColumnName } = useOptimisticColumns(
    props.boardId,
    props.columns,
  )
  const scrollContainerRef = useRef<HTMLUListElement>(null)

  return (
    <AnimatePresence initial={false}>
      <ul
        ref={scrollContainerRef}
        className="flex h-full min-h-[calc(100dvh-152px)] w-full snap-x snap-mandatory scroll-pl-20 gap-2 overflow-x-scroll px-20 pb-20"
      >
        {columns.map((column) => (
          <li key={column.id} className="snap-start">
            <Column
              id={column.id}
              name={column.name}
              cards={column.cards}
              scrollContainerRef={scrollContainerRef as RefObject<HTMLUListElement>}
              updateName={(name) => updateColumnName(name, column.id)}
              removeColumn={(columnId) => removeColumn({ boardId: props.boardId, columnId })}
              addCard={(name) => addCard({ name, columnId: column.id })}
              removeCard={removeCard}
              moveCard={moveCard}
            />
          </li>
        ))}
        <li>
          <AddColumnForm addColumn={addColumn} />
        </li>
        <li className="h-1 w-20 flex-shrink-0" />
      </ul>
    </AnimatePresence>
  )
}

const AddColumnForm = ({ addColumn }: { addColumn: (name: string) => void }) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const stopEditing = () => {
    setEditing(false)
    setName('')
  }

  const handleSubmit = () => {
    setName('')
    addColumn(name)
  }

  if (!editing)
    return (
      <button
        className="focusable pressable mt-1 w-max rounded-xl px-2.5 py-1.5 text-left font-medium transition-all hover:bg-gray-100 hover:shadow-sm"
        onClick={() => setEditing(true)}
      >
        + add column
      </button>
    )

  return (
    <form
      className="mt-1 flex w-80 flex-col gap-2 rounded-xl bg-gray-100 p-2 shadow-sm"
      ref={formRef}
      noValidate={false}
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) stopEditing()
      }}
    >
      <input
        required
        autoFocus
        className="w-full resize-none rounded-lg p-2 py-1"
        onChange={(e) => setName(e.target.value)}
        value={name}
        onKeyDown={(e) => {
          if (e.key === 'Escape') stopEditing()
          if (e.key === 'Enter') {
            e.preventDefault()
            formRef.current?.requestSubmit()
          }
        }}
      />
      <div className="flex gap-2">
        <button type="submit" className="focusable pressable rounded-lg bg-gray-700 px-2 py-1.5 text-white hover:bg-gray-900">
          Create
        </button>
        <button type="button" onClick={() => stopEditing()} className="focusable pressable rounded-lg px-2 py-1.5 hover:bg-gray-200">
          Cancel
        </button>
      </div>
    </form>
  )
}

const Column = (props: {
  name: string
  id: string
  cards: { name: string; id: string; order: number }[]
  scrollContainerRef: RefObject<HTMLUListElement>
  updateName: (name: string) => void
  removeColumn: (id: string) => void
  addCard: (name: string) => void
  removeCard: (cardId: string) => void
  moveCard: (args: { cardId: string; columnId: string; order: number }) => void
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [closestIndicatorIndex, setClosestIndicatorIndex] = useState<null | number>(null)

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
    highlightIndicators(e)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    setDragOver(false)
    setClosestIndicatorIndex(null)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    setDragOver(false)

    const cardId = e.dataTransfer.getData('card-id')

    const columnId = props.id
    const toOrder =
      closestIndicatorIndex === -1 || closestIndicatorIndex === null ? (props.cards.at(-1)?.order ?? 0) + 1 : closestIndicatorIndex

    const currentIndex = props.cards.findIndex((card) => card.order === toOrder)
    const aboveOrder = props.cards[currentIndex - 1]?.order ?? 0

    let newOrder = (aboveOrder + toOrder) / 2
    if (currentIndex === -1) newOrder = (props.cards.at(-1)?.order ?? 0) + 1

    props.moveCard({ cardId, columnId, order: newOrder })

    setClosestIndicatorIndex(null)
  }

  const getIndicators = () => {
    return Array.from(document.querySelectorAll<HTMLDivElement>(`[data-colid="${props.id}"]`))
  }

  const highlightIndicators = (e: DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators()

    const closestIndicator = indicators.reduce(
      (closestIndicator, indicator) => {
        const box = indicator.getBoundingClientRect()
        const offset = e.clientY - box.top

        if (offset > 0 && offset < closestIndicator.offset)
          return { offset, beforeOrder: parseFloat(indicator.dataset.beforeorder ?? '-1') }
        return closestIndicator
      },
      { offset: Infinity, beforeOrder: -1 },
    )

    setClosestIndicatorIndex(closestIndicator.beforeOrder)
  }

  const removeColumn = () => {
    if (props.cards.length > 0) {
      if (!confirm(`Are you sure you want to delete this column? You'll delete ${props.cards.length} cards along with the column.`)) return
    }

    props.removeColumn(props.id)
  }

  return (
    <ColumnPresence scrollContainerRef={props.scrollContainerRef}>
      <div
        className={cn(
          'mt-1 flex w-80 flex-col gap-2 rounded-xl bg-gray-100 p-2 pt-3 shadow-sm',
          dragOver && props.cards.length === 0 && 'opacity-100 ring-[3px] ring-red-500',
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="group flex w-full justify-between px-2">
          <ColumnName name={props.name} updateName={props.updateName} />
          <button
            onClick={removeColumn}
            className="pressable focusable -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 opacity-0 ring-red-500 transition-all hover:text-red-500 group-hover:opacity-100"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>

        {props.cards.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {props.cards.map((card) => (
              <Fragment key={card.id}>
                <DropIndicator showing={card.order === closestIndicatorIndex} columnId={props.id} beforeOrder={card.order} />
                <Card name={card.name} id={card.id} order={card.order} removeCard={() => props.removeCard(card.id)} />
              </Fragment>
            ))}
            <DropIndicator showing={closestIndicatorIndex === -1} columnId={props.id} beforeOrder={-1} />
          </div>
        )}
        <AddCardForm addCard={props.addCard} />
      </div>
    </ColumnPresence>
  )
}

const ColumnPresence = ({
  scrollContainerRef,
  ...props
}: ComponentProps<typeof motion.div> & { scrollContainerRef: RefObject<HTMLUListElement> }) => {
  const columnRef = useRef<HTMLDivElement>(null)

  const { scrollX } = useScroll({ container: scrollContainerRef, axis: 'x' })
  const relativeX = useTransform(scrollX, (value) => {
    const leftOffset = value - (columnRef.current?.offsetLeft ?? 0)
    const rightOffset =
      scrollContainerRef.current?.clientWidth! - (columnRef.current?.offsetLeft ?? 0) - (columnRef.current?.clientWidth ?? 0) + value - 200

    return Math.max(leftOffset, -1 * rightOffset)
  })

  const opacity = useTransform(relativeX, [80, 200], [1, 0.6])
  const safeToUseOpacity = useTransform(opacity, (value) => (isNaN(value) ? 1 : value))

  return <motion.div ref={columnRef} style={{ opacity: safeToUseOpacity }} {...props} />
}

const ColumnName = (props: { name: string; updateName: (name: string) => void }) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(props.name)

  if (!isEditingName)
    return (
      <button onClick={() => setIsEditingName(true)} className="w-11/12 shrink text-left">
        <h2 className="truncate">{name}</h2>
      </button>
    )

  return (
    <input
      autoFocus
      className="focusable -ml-2 w-11/12 rounded-lg px-2"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          setIsEditingName(false)
          props.updateName(name)
        }
      }}
      onBlur={() => {
        setIsEditingName(false)
        props.updateName(name)
      }}
    />
  )
}

const AddCardForm = ({ addCard }: { addCard: (name: string) => void }) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const stopEditing = () => {
    setEditing(false)
    setName('')
  }

  const handleSubmit = () => {
    setName('')
    addCard(name)
  }

  if (!editing)
    return (
      <button
        className="focusable pressable rounded-lg px-2.5 py-1.5 text-left font-medium hover:bg-gray-200"
        onClick={() => setEditing(true)}
      >
        + add card
      </button>
    )

  return (
    <form
      ref={formRef}
      noValidate={false}
      onSubmit={(e) => {
        e.preventDefault()

        handleSubmit()
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) stopEditing()
      }}
    >
      <textarea
        required
        autoFocus
        className="w-full resize-none rounded-lg p-2 py-1"
        rows={3}
        onChange={(e) => setName(e.target.value)}
        value={name}
        onKeyDown={(e) => {
          if (e.key === 'Escape') stopEditing()
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            formRef.current?.requestSubmit()
          }
        }}
      />
      <div className="flex gap-2">
        <button type="submit" className="focusable pressable rounded-lg bg-gray-700 px-2 py-1.5 text-white hover:bg-gray-900">
          Save Card
        </button>
        <button type="button" onClick={() => stopEditing()} className="focusable pressable rounded-lg px-2 py-1.5 hover:bg-gray-200">
          Cancel
        </button>
      </div>
    </form>
  )
}

const Card = (props: { name: string; id: string; order: number; removeCard: () => void }) => {
  return (
    <>
      <div
        onDragStart={(e) => {
          e.dataTransfer.setData('card-id', props.id)
        }}
        className={cn(
          'border-t-px border-b-px py-1shadow-sm group flex w-full cursor-grab justify-between rounded-lg border border-transparent bg-white px-2 py-1 active:cursor-grabbing',
        )}
        draggable
      >
        <p className="hyphens-auto whitespace-pre-wrap break-words">{props.name}</p>
        <button className="pressable focusable -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 opacity-0 ring-red-500 transition-all hover:text-red-500 group-hover:opacity-100">
          <Trash2Icon className="size-4" onClick={props.removeCard} />
        </button>
      </div>
    </>
  )
}

const DropIndicator = ({ showing, columnId, beforeOrder }: { showing: boolean; columnId: string; beforeOrder: number }) => {
  return (
    <div
      className={cn('h-1 w-full rounded-full bg-transparent', showing && 'bg-red-500')}
      data-colid={columnId}
      data-beforeorder={beforeOrder}
    />
  )
}
