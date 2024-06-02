'use client'
import { DragEvent, Fragment, startTransition, useOptimistic, useRef, useState } from 'react'
import { addColumnAction, addCardAction, removeColumnAction, moveCardAction } from './actions'
import { nanoid } from 'nanoid'
import { produce } from 'immer'
import { cn } from '@/lib/utils'

export const Board = (props: {
  boardId: string
  columns: { order: number; name: string; id: string; cards: { id: string; columnId: string; name: string; order: number }[] }[]
}) => {
  const [columns, setColumns] = useOptimistic(props.columns)

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
      const newCard = { id: nanoid(), name, columnId, order: columns.find((column) => column.id === columnId)?.cards.length ?? 0 }

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
    console.log('moving card', cardId, 'to column', columnId, 'at order', order)
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

  return (
    <div className="min-h-screen w-full overflow-x-scroll">
      <div className="px-20 pb-20">
        <ul className="flex w-full gap-2">
          {columns.map((column) => (
            <li key={column.id}>
              <Column
                id={column.id}
                name={column.name}
                cards={column.cards}
                removeColumn={(columnId: string) => removeColumn({ boardId: props.boardId, columnId })}
                addCard={(name: string) => addCard({ name, columnId: column.id })}
                moveCard={moveCard}
              />
            </li>
          ))}
          <li>
            <AddColumnButton addColumn={addColumn} />
          </li>
          <li className="h-1 w-20 flex-shrink-0" />
        </ul>
      </div>
    </div>
  )
}

const AddColumnButton = ({ addColumn }: { addColumn: (name: string) => void }) => {
  return <button onClick={() => addColumn('New Column')}>+</button>
}

const Column = (props: {
  name: string
  id: string
  cards: { name: string; id: string; order: number }[]
  removeColumn: (id: string) => void
  addCard: (name: string) => void
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

    console.log(aboveOrder, toOrder, currentIndex)

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

  return (
    <div
      className={cn(
        'mt-1 flex min-w-80 flex-col gap-2 rounded-xl bg-slate-100 p-2 shadow-sm shadow-slate-400',
        dragOver && props.cards.length === 0 && 'ring-2 ring-slate-500 ring-opacity-70',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex justify-between px-2">
        <h2>{props.name}</h2> <button onClick={() => props.removeColumn(props.id)}>x</button>
      </div>

      <div className="flex flex-col gap-0.5">
        {props.cards.map((card) => (
          <Fragment key={card.id}>
            <DropIndicator showing={card.order === closestIndicatorIndex} columnId={props.id} beforeOrder={card.order} />
            <Card name={card.name} id={card.id} order={card.order} />
          </Fragment>
        ))}
        <DropIndicator showing={closestIndicatorIndex === -1} columnId={props.id} beforeOrder={-1} />
      </div>
      <AddCardForm addCard={props.addCard} />
    </div>
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
      <button className="pressable rounded-lg p-2 font-medium hover:bg-slate-200" onClick={() => setEditing(true)}>
        + add a card
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
          if (e.key === 'Enter') {
            e.preventDefault()
            formRef.current?.requestSubmit()
          }
        }}
      />
      <div className="flex gap-2">
        <button type="submit" className="focusable pressable rounded-lg bg-slate-700 px-2 py-1.5 text-white hover:bg-slate-900">
          Save Card
        </button>
        <button type="button" onMouseDown={() => stopEditing()} className="focusable pressable rounded-lg px-2 py-1.5 hover:bg-slate-200">
          Cancel
        </button>
      </div>
    </form>
  )
}

const Card = (props: { name: string; id: string; order: number }) => {
  return (
    <>
      <div
        onDragStart={(e) => {
          e.dataTransfer.setData('card-id', props.id)
        }}
        className={cn(
          'border-t-px border-b-px cursor-grab rounded-lg border border-transparent bg-white px-2 py-1 shadow shadow-slate-300 active:cursor-grabbing',
        )}
        draggable
      >
        {props.name}
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
