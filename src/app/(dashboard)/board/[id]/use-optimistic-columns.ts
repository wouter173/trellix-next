import { produce } from 'immer'
import { nanoid } from 'nanoid'
import { startTransition, useOptimistic } from 'react'
import { addCardAction, addColumnAction, deleteCardAction, moveCardAction, removeColumnAction, updateColumnNameAction } from './actions'

export function useOptimisticColumns(
  boardId: string,
  columns: { order: number; name: string; id: string; cards: { id: string; columnId: string; name: string; order: number }[] }[],
) {
  const [optimisticColumns, setOptimisticColumns] = useOptimistic(columns)

  const addColumn = (name: string) => {
    startTransition(async () => {
      const id = nanoid()
      const newCol = { name, id, order: columns.length, cards: [] }

      setOptimisticColumns([...columns, newCol])
      await addColumnAction({ ...newCol, boardId })
    })
  }

  const removeColumn = ({ columnId, boardId }: { columnId: string; boardId: string }) => {
    startTransition(async () => {
      setOptimisticColumns(columns.filter((column) => column.id !== columnId))
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

      setOptimisticColumns(nextState)

      await addCardAction({
        ...newCard,
        boardId,
        order: newCard.order,
      })
    })
  }

  const moveCard = ({ cardId, columnId, order }: { cardId: string; columnId: string; order: number }) => {
    startTransition(async () => {
      const card = columns.flatMap((column) => column.cards).find((card) => card.id === cardId)
      if (!card) return

      const toColumnId = columnId

      const nextState = produce(columns, (draftColumns) => {
        const fromColumnIndex = draftColumns.findIndex((column) => column.id === card.columnId)
        const toColumnIndex = draftColumns.findIndex((column) => column.id === toColumnId)

        const fromColumn = draftColumns[fromColumnIndex]
        const toColumn = draftColumns[toColumnIndex]

        const cardIndex = fromColumn.cards.findIndex((card) => card.id === cardId)
        fromColumn.cards.splice(cardIndex, 1)

        toColumn.cards.push({ ...card, columnId: toColumnId, order: order })
        toColumn.cards.sort((a, b) => a.order - b.order)
      })

      setOptimisticColumns(nextState)

      await moveCardAction({ toColumnId, order, cardId, boardId })
    })
  }

  const updateColumnName = (name: string, columnId: string) => {
    startTransition(async () => {
      const columnIndex = columns.findIndex((column) => column.id === columnId)
      const nextState = produce(columns, (draftColumns) => {
        draftColumns[columnIndex].name = name
      })

      setOptimisticColumns(nextState)

      await updateColumnNameAction({ name, columnId, boardId })
    })
  }

  const removeCard = (cardId: string) => {
    startTransition(async () => {
      const nextState = produce(columns, (draftColumns) => {
        const columnIndex = draftColumns.findIndex((column) => column.cards.some((card) => card.id === cardId))
        const cardIndex = draftColumns[columnIndex].cards.findIndex((card) => card.id === cardId)
        draftColumns[columnIndex].cards.splice(cardIndex, 1)
      })

      setOptimisticColumns(nextState)

      await deleteCardAction({ cardId, boardId })
    })
  }

  return {
    columns: optimisticColumns,
    addColumn,
    updateColumnName,
    removeColumn,
    addCard,
    moveCard,
    removeCard,
  }
}
