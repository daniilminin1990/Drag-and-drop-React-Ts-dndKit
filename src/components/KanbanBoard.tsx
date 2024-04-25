import {PlusIcon} from "./PlusIcon";
import {useMemo, useState} from "react";
import {Column, TaskType} from "../types";
import {ColumnContainer} from "./ColumnContainer";
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragEndEvent, DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor, UniqueIdentifier,
  useSensor,
  useSensors,
  CollisionDetection, rectIntersection, pointerWithin
} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {createPortal} from "react-dom";
import {TaskCard} from "./TaskCard";
import {useAppDispatch, useAppSelector} from "../store";
import {columnsActions} from "../columnsSlice";
import {tasksActions, TaskStateType} from "../tasksSlice";
import {v1} from "uuid";
import {Rect} from "@dnd-kit/core/dist/utilities";
import {getIntersectionRatio} from "@dnd-kit/core/dist/utilities/algorithms/rectIntersection";



export const KanbanBoard = () => {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector(state => (state.tasks));
  const columns = useAppSelector(state => state.columns.columns)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const columnsIds = useMemo(() => columns.map(column => column.id), [columns])
  const nonAssTasksArray = useMemo(() => {
    const tasksArray: TaskType[] = [];
    Object.values(tasks.tasks).forEach(columnTasks => {
      columnTasks.forEach(task => {
        tasksArray.push(task);
      });
    });
    return tasksArray;
  }, [tasks]);
  console.log(nonAssTasksArray)

  const createNewColumnHandler = () => {
    const columnToAdd: Column = {
      id: v1(),
      title: `Column ${columns.length + 1}`
    }
    dispatch(columnsActions.addColumn(columnToAdd))
  }

  const deleteColumnHandler = (id: string) => {

    dispatch(columnsActions.deleteColumn(id))
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // ? На RTK
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

  const onDragOverHandler = (event: DragOverEvent) => {
    const {active, over} = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId == overId) return

    // 1 сценарий -- Дропаю таску над другой таской.
    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"
    // const isOverAColumn = over.data.current?.type === 'Column'

    if (!isActiveATask) return

    if (isActiveATask && isOverATask && active.data.current?.task?.columnId === over.data.current?.task?.columnId) {
      if (!activeTask) return
      console.log('isActiveATask && isOverATask 1')
      dispatch(tasksActions.moveTask({
        colId: active.data.current?.task?.columnId.toString(),
        activeTaskId: activeId.toString(),
        overTaskId: overId.toString(),
        nonAssTasksArray: nonAssTasksArray
        // activeTaskId: prevActiveTaskId,
        // overTaskId: prevOverTaskId
      }));
    }

    // 2 сценарий -- Дропаю таску над column
    const isOverAColumn = over.data.current?.type === 'Column'
    if (isActiveATask && isOverAColumn) {
      console.log('isActiveATask && isOverAColumn')
      if (!activeTask) return
      dispatch(tasksActions.moveTaskAcrossTodos({
        colId: active.data.current?.task?.columnId.toString(),
        activeTaskId: activeId.toString(),
        overColumnId: overId.toString(),
      }))

    }
    // dispatch(tasksActions.moveTaskCombined({
    //   tasks: tasks,
    //   activeColId: active.data.current?.task?.id.toString(),
    //   overColId: over.data.current?.task?.id.toString(),
    //   activeId: active?.id.toString(),
    //   overId: over?.id.toString(),
    //   isOverATask: isOverATask,
    //   isOverAColumn: isOverAColumn
    // }));
  }

  const onDragEndHandler = (event: DragEndEvent) => {
    setActiveColumn(null)
    setActiveTask(null)
    // Зануляем active элементы
    const {active, over} = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId == overId) return

    dispatch(columnsActions.moveColumn({
      fromColumnId: activeId.toString(),
      toColumnId: overId.toString()
    }))

  }


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {distance: 3},
    })
  )
  const updateColumnHandler = (id: string, title: string) => {
    dispatch(columnsActions.updateColumn({id, title}))
  }

  const createTaskHandler = (colId: string) => {
    const newTask: TaskType = {
      id: v1(),
      columnId: colId,
      content: `Task ${tasks.tasks[colId].length + 1}`
    }
    dispatch(tasksActions.addTask({colId, task: newTask}))
  }

  const deleteTaskHandler = (colId: string, taskId: string) => {
    dispatch(tasksActions.deleteTask({colId: colId,taskId: taskId}))
  }

  const updateTaskHandler = (colId: string, taskId: string, content: string) => {
    dispatch(tasksActions.updateTask({colId: colId, taskId: taskId, content}));
  }
  return (
    <div className=" m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]
    ">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStartHandler}
        onDragEnd={onDragEndHandler}
        onDragOver={onDragOverHandler}
        collisionDetection={closestCorners}
      >
        <div className="m-auto flex gap-4">
          <SortableContext items={columns.map(column => column.id)}>
            <div className="flex gap-4">
              {columns.map(column => {
                  return (
                    <div key={column.id}>
                      <ColumnContainer
                        key={column.id}
                        column={column}
                        deleteColumn={deleteColumnHandler}
                        updateColumn={updateColumnHandler}
                        createTask={createTaskHandler}
                        tasks={tasks}
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
              tasks={tasks}
              updateTask={updateTaskHandler}
            />)}
          {activeTask && (
            <TaskCard task={activeTask} deleteTask={deleteTaskHandler} updateTask={updateTaskHandler} colId={activeTask.columnId}/>
          )}
        </DragOverlay>, document.body)}
      </DndContext>
    </div>
  )
}

// // ? Без applyMove
//   const onDragStartHandler = (event: DragStartEvent) => {
//     if (event.active.data.current?.type === "Column") {
//       setActiveColumn(event.active.data.current.column)
//       return
//     }
//     if (event.active.data.current?.type === "Task") {
//       setActiveTask(event.active.data.current.task)
//       return
//     }
//   }
//   const onDragOverHandler = (event: DragOverEvent) => {
//     const {active, over} = event
//     if (!over) return
//
//     const activeId = active.id
//     const overId = over.id
//
//     if (activeId == overId) return
//
//     // 1 сценарий -- Дропаю таску над другой таской.
//     const isActiveATask = active.data.current?.type === "Task"
//     const isOverATask = over.data.current?.type === "Task"
//
//     if(!isActiveATask) return
//
//     if(isActiveATask && isOverATask){
//       setTasks(tasks => {
//         const activeIndex = tasks.findIndex(task => task.id === activeId)
//         const overIndex = tasks.findIndex(task => task.id === overId)
//
//         const newTasks = [...tasks]
//         const activeTask = newTasks.splice(activeIndex, 1)[0]
//         newTasks.splice(overIndex, 0, activeTask)
//
//         // Переставляем таски в другой column
//         activeTask.columnId = tasks[overIndex].columnId
//
//         return newTasks
//       })
//     }
//
//     // 2 сценарий -- Дропаю таску над column
//     const isOverAColumn = over.data.current?.type === 'Column'
//     if(isActiveATask && isOverAColumn){
//       setTasks(tasks => {
//         const activeIndex = tasks.findIndex(task => task.id === activeId)
//
//         const newTasks = [...tasks]
//         const activeTask = newTasks[activeIndex]
//
//         // Переставляем таски в другой column
//         activeTask.columnId = overId
//
//         return newTasks
//       })
//     }
//   }
//   const onDragEndHandler = (event: DragEndEvent) => {
//     // Зануляем active элементы
//     setActiveColumn(null)
//     setActiveTask(null)
//     const {active, over} = event
//     if (!over) return
//
//     const activeId = active.id
//     const overId = over.id
//
//     if (activeId == overId) return
//
//     setColumns(columns => {
//       const activeColumnIndex = columns.findIndex(column => column.id === activeId)
//       const overColumnIndex = columns.findIndex(column => column.id === overId)
//
//       const newColumns = [...columns]
//       const activeColumn = newColumns.splice(activeColumnIndex, 1)[0]
//       newColumns.splice(overColumnIndex, 0, activeColumn)
//
//       return newColumns
//     })
//   }