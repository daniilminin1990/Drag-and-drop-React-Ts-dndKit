import {PlusIcon} from "./PlusIcon";
import {useMemo, useState} from "react";
import {Column, TaskType} from "../types";
import {ColumnContainer} from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent, DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {createPortal} from "react-dom";
import {TaskCard} from "./TaskCard";

const generateId = () => {
//   Generate a random number between 0 and 10000
  return Math.floor(Math.random() * 10001)
}

export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const columnsId = useMemo(() => columns.map(column => column.id), [columns])
  const createNewColumnHandler = () => {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`
    }
    setColumns([...columns, columnToAdd])
  }

  const deleteColumnHandler = (id: string | number) => {
    const filteredColumn = columns.filter(column => column.id !== id)
    setColumns(filteredColumn)

    const newTasks = tasks.filter(t => t.columnId !== id)
    setTasks(newTasks)
  }

  const onDragStartHandler = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column)
      return
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
      return
    }
  }

  const onDragEndHandler = (event: DragEndEvent) => {
    // Зануляем active элементы
    setActiveColumn(null)
    setActiveTask(null)
    const {active, over} = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId == overId) return

    setColumns(columns => {
      const activeColumnIndex = columns.findIndex(column => column.id === activeId)
      const overColumnIndex = columns.findIndex(column => column.id === overId)
      // const newColumns = [...columns]
      // newColumns.splice(overColumnIndex, 0, newColumns.splice(activeColumnIndex, 1)[0])
      // return newColumns
      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  const onDragOverHandler = (event: DragOverEvent) => {
    const {active, over} = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId == overId) return

    // 1 сценарий -- Дропаю таску над другой таской.
    // Нужно проверить активный элемент (который тащим) и over элемент, тот на кого перетаскиваем, являются ли они оба тасками
    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"

    if(!isActiveATask) return

    if(isActiveATask && isOverATask){
      setTasks(tasks => {
        // Определяем index-ы для активного и over элемента
        const activeIndex = tasks.findIndex(task => task.id === activeId)
        const overIndex = tasks.findIndex(task => task.id === overId)

        // Переставляем таски в другой column
        tasks[activeIndex].columnId = tasks[overIndex].columnId

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    // 2 сценарий -- Дропаю таску над column
    const isOverAColumn = over.data.current?.type === 'Column'
    if(isActiveATask && isOverAColumn){
      // Можем просто засэтать для активной таски новый columnId, который будет соответсвовавть overId
      setTasks(tasks => {
        // Определяем index-ы для активного элемента
        const activeIndex = tasks.findIndex(task => task.id === activeId)

        // Переставляем таски в другой column
        tasks[activeIndex].columnId = overId

        // Зачем дважды activeIndex? -- затем, что с arrayMove я триггерю ререндер тасок, потому что я создаю новый массив
        return arrayMove(tasks, activeIndex, activeIndex)
      })
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 3},
    })
  )
  const updateColumnHandler = (id: string | number, title: string) => {
    const newColumns = columns.map((column: Column) => column.id === id ? {...column, title} : column)
    setColumns(newColumns)
  }

  const createTaskHandler = (id: string | number) => {
    const newTask: TaskType = {
      id: generateId(),
      columnId: id,
      content: `Task ${tasks.length + 1}`
    }
    setTasks([...tasks, newTask])
  }

  const deleteTaskHandler = (id: string | number) => {
    const newTasks = tasks.filter(task => task.id !== id)
    setTasks(newTasks)
  }

  const updateTaskHandler = (id: string | number, content: string) => {
    const newTasks = tasks.map((task: TaskType) => task.id === id ? {...task, content} : task)
    setTasks(newTasks)
  }
  return (
    <div className=" m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]
    ">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStartHandler}
        onDragEnd={onDragEndHandler}
        onDragOver={onDragOverHandler}
      >
        <div className="m-auto flex gap-4">
          <SortableContext items={columnsId}>
            <div className="flex gap-4">{columns.map(column => {
                return (
                  <div key={column.id}>
                    <ColumnContainer
                      key={column.id}
                      column={column}
                      deleteColumn={deleteColumnHandler}
                      updateColumn={updateColumnHandler}
                      createTask={createTaskHandler}
                      tasks={tasks.filter(task => task.columnId === column.id)}
                      deleteTask={deleteTaskHandler}
                      updateTask={updateTaskHandler}
                    />
                  </div>
                )
              }
            )}
            </div>
          </SortableContext>
          <button
            onClick={createNewColumnHandler}
            className="h-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2
      ">
            <PlusIcon/>
            Add column
          </button>
        </div>
        {createPortal(<DragOverlay>
          {activeColumn && (
            <ColumnContainer
              column={activeColumn}
              deleteColumn={deleteColumnHandler}
              updateColumn={updateColumnHandler}
              createTask={createTaskHandler}
              deleteTask={deleteTaskHandler}
              tasks={tasks.filter(task => task.columnId === activeColumn.id)}
              updateTask={updateTaskHandler}
            />)}
          {activeTask && (
            <TaskCard task={activeTask} deleteTask={deleteTaskHandler} updateTask={updateTaskHandler}/>
            )}
        </DragOverlay>, document.body)}
      </DndContext>
    </div>
  )
}