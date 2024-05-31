'use client'
import { startTransition, useActionState, useOptimistic } from 'react'
import { addColumnAction, removeColumnAction } from './actions'
import { nanoid } from 'nanoid'

export const Board = (props: {
  boardId: string
  columns: { name: string; id: string; tasks: { id: string; columnId: string; name: string }[] }[]
}) => {
  const [columns, setColumns] = useOptimistic(props.columns)

  const addColumn = (name: string) => {
    startTransition(async () => {
      const id = nanoid()
      setColumns([...columns, { name, id, tasks: [] }])
      await addColumnAction({ name, boardId: props.boardId })
    })
  }

  const removeColumn = ({ columnId, boardId }: { columnId: string; boardId: string }) => {
    startTransition(async () => {
      setColumns(columns.filter((column) => column.id !== columnId))
      await removeColumnAction({ columnId, boardId })
    })
  }

  return (
    <div className="h-screen w-full overflow-x-scroll">
      <div className="px-20">
        <ul className="flex w-full gap-2">
          {columns.map((column) => (
            <li key={column.id}>
              <Column
                id={column.id}
                name={column.name}
                tasks={column.tasks}
                removeColumn={(columnId: string) => removeColumn({ boardId: props.boardId, columnId })}
              />
            </li>
          ))}
          <li>
            <AddColumnButton addColumn={addColumn} />
          </li>
          <li>
            <div data-lol="" className="h-1 w-20 flex-shrink-0"></div>
          </li>
        </ul>
      </div>
    </div>
  )
}

const AddColumnButton = ({ addColumn }: { addColumn: (name: string) => void }) => {
  return <button onClick={() => addColumn('New Column')}>+</button>
}

const Column = (props: { name: string; id: string; tasks: { name: string; id: string }[]; removeColumn: (id: string) => void }) => {
  return (
    <div className="min-w-96 rounded-lg bg-white p-2">
      <div className="flex justify-between">
        <h2>{props.name}</h2> <button onClick={() => props.removeColumn(props.id)}>x</button>
      </div>

      <ul className="">
        {props.tasks.map((task) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  )
}
