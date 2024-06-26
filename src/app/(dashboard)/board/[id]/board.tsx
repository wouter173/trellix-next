'use client'
import { ComponentProps, DragEvent, Fragment, RefObject, startTransition, useOptimistic, useRef, useState } from 'react'
import { addColumnAction, addCardAction, removeColumnAction, moveCardAction, updateColumnNameAction, deleteCardAction } from './actions'
import { nanoid } from 'nanoid'
import { produce } from 'immer'
import { cn } from '@/lib/utils'
import { Trash2Icon } from 'lucide-react'
import { AnimatePresence, motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'

export const Board = (props: {
  boardId: string
  columns: { order: number; name: string; id: string; cards: { id: string; columnId: string; name: string; order: number }[] }[]
}) => {
  const [columns, setColumns] = useOptimistic(props.columns)
  const scrollContainerRef = useRef<HTMLUListElement>(null)

  const addColumn = (name: string) => {
    startTransition(async () => {
      const id = nanoid()
      const newCol = { name, id, order: columns.length, cards: [] }

      setColumns([...columns, newCol])
      await addColumnAction({ ...newCol, boardId: props.boardId })
    })
  }

  const removeColumn = ({ columnId, boardId }: { columnId: string; boardId: string }) => {
    startTransition(async () => {
      setColumns(columns.filter((column) => column.id !== columnId))
      await removeColumnAction({ columnId, boardId })
    })
  }

  const addCard = ({ columnId, name }: { name: string; columnId: string }) => {
    startTransition(async () => {
      const newCard = { id: nanoid(), name, columnId, order: (columns.find((column) => column.id === columnId)?.cards.length ?? 0) + 1 }

      const nextState = produce(columns, (draftColumns) => {
        const columnIndex = draftColumns.findIndex((column) => column.id === columnId)
        draftColumns[columnIndex].cards.push(newCard)
      })

      setColumns(nextState)

      await addCardAction({
        ...newCard,
        boardId: props.boardId,
        order: newCard.order,
      })
    })
  }

  const moveCard = ({ cardId, columnId, order }: { cardId: string; columnId: string; order: number }) => {
    startTransition(async () => {
      const card = columns.flatMap((column) => column.cards).find((card) => card.id === cardId)
      if (!card) return

      await moveCardAction({
        toColumnId: columnId,
        order,
        cardId,

        boardId: props.boardId,
      })
    })
  }

  const updateColumnName = (name: string, columnId: string) => {
    startTransition(async () => {
      const columnIndex = columns.findIndex((column) => column.id === columnId)
      const nextState = produce(columns, (draftColumns) => {
        draftColumns[columnIndex].name = name
      })

      setColumns(nextState)

      await updateColumnNameAction({ name, columnId, boardId: props.boardId })
    })
  }

  const deleteCard = (cardId: string) => {
    startTransition(async () => {
      const nextState = produce(columns, (draftColumns) => {
        const columnIndex = draftColumns.findIndex((column) => column.cards.some((card) => card.id === cardId))
        const cardIndex = draftColumns[columnIndex].cards.findIndex((card) => card.id === cardId)
        draftColumns[columnIndex].cards.splice(cardIndex, 1)
      })

      setColumns(nextState)

      await deleteCardAction({ cardId, boardId: props.boardId })
    })
  }

  return (
    <AnimatePresence initial={false}>
      <ul ref={scrollContainerRef} className="flex h-full w-full snap-x snap-mandatory scroll-pl-20 gap-2 overflow-x-scroll px-20">
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
              deleteCard={deleteCard}
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
        className="focusable pressable mt-1 w-max rounded-xl px-2.5 py-1.5 text-left font-medium shadow-slate-400 transition-all hover:bg-slate-100 hover:shadow-sm"
        onClick={() => setEditing(true)}
      >
        + add column
      </button>
    )

  return (
    <form
      className="mt-1 flex w-80 flex-col gap-2 rounded-xl bg-slate-100 p-2 shadow-sm shadow-slate-400"
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
        <button type="submit" className="focusable pressable rounded-lg bg-slate-700 px-2 py-1.5 text-white hover:bg-slate-900">
          Create
        </button>
        <button type="button" onClick={() => stopEditing()} className="focusable pressable rounded-lg px-2 py-1.5 hover:bg-slate-200">
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
  deleteCard: (cardId: string) => void
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
          'mt-1 flex w-80 flex-col gap-2 rounded-xl bg-slate-100 p-2 pt-3 shadow-sm shadow-slate-400',
          dragOver && props.cards.length === 0 && 'opacity-100 ring-[3px] ring-red-500',
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex w-full justify-between px-2">
          <ColumnName name={props.name} updateName={props.updateName} />
          <button
            onClick={removeColumn}
            className="pressable focusable -mr-1 flex size-6 items-center justify-center rounded-md text-slate-400 ring-red-500 transition-all hover:text-red-500"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>

        {props.cards.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {props.cards.map((card) => (
              <Fragment key={card.id}>
                <DropIndicator showing={card.order === closestIndicatorIndex} columnId={props.id} beforeOrder={card.order} />
                <Card name={card.name} id={card.id} order={card.order} deleteCard={() => props.deleteCard(card.id)} />
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
      scrollContainerRef.current?.clientWidth - (columnRef.current?.offsetLeft ?? 0) - (columnRef.current?.clientWidth ?? 0) + value - 200

    return Math.max(leftOffset, -1 * rightOffset)
  })

  const opacity = useTransform(relativeX, [80, 200], [1, 0.6])

  return (
    <>
      <motion.div ref={columnRef} style={{ opacity }} {...props} />
    </>
  )
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
        className="focusable pressable rounded-lg px-2.5 py-1.5 text-left font-medium hover:bg-slate-200"
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
        <button type="submit" className="focusable pressable rounded-lg bg-slate-700 px-2 py-1.5 text-white hover:bg-slate-900">
          Save Card
        </button>
        <button type="button" onClick={() => stopEditing()} className="focusable pressable rounded-lg px-2 py-1.5 hover:bg-slate-200">
          Cancel
        </button>
      </div>
    </form>
  )
}

const Card = (props: { name: string; id: string; order: number; deleteCard: () => void }) => {
  return (
    <>
      <div
        onDragStart={(e) => {
          e.dataTransfer.setData('card-id', props.id)
        }}
        className={cn(
          'border-t-px border-b-px flex w-full cursor-grab justify-between hyphens-auto whitespace-pre-wrap break-all rounded-lg border border-transparent bg-white px-2 py-1 text-justify shadow shadow-slate-300 active:cursor-grabbing',
        )}
        draggable
      >
        {props.name}
        <button className="pressable focusable -mr-1 flex size-6 items-center justify-center rounded-md text-slate-400 ring-red-500 transition-all hover:text-red-500">
          <Trash2Icon className="size-4" onClick={props.deleteCard} />
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
