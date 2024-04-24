import {TaskType} from "../types";
import {TrashIcon} from "./TrashIcon";
import {useState} from "react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

interface Props {
  task: TaskType
  deleteTask: (taskId: string) => void
  updateTask: (taskId: string, content: string) => void
}

export const TaskCard = (props: Props) => {
  const {task, deleteTask, updateTask} = props
  const [mouseIsOver, setMouseIsOver] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const toggleEditMode = () => {
    setEditMode(prev => !prev)
    setMouseIsOver(false)
  }
  const {setNodeRef, attributes, listeners, transform, transition, isDragging} = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task
    },
    disabled: editMode
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }
  if(isDragging){
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-mainBackgroundColor p-2.5 h-[100px] min-h[100px] items-center
    flex text-left rounded-xl border-2 border-rose-500 cursor-grab relative
    opacity-30"
      />
    )
  }
  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-2.5 h-[100px] min-h[100px] items-center
    flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
           key={task.id}
           >
        <textarea className="
         h-[90%] w-full resize-none border-none rounded bg-transparent
         text-white focus:outline-none
         "
         value={task.content}
         autoFocus
         placeholder="Task content here"
         onBlur={toggleEditMode}
         onKeyDown={(e) => {
           // Можем менять название тасок
           // Но вот какая штука. Если пользователь захочет ввести несколько строк, то у него не получится, потому что когда нажимает на enter, у него editMode переводится в false.
           //   Значит нужно доработать условие, поэтому добавим + shift
           if(e.key === "Enter" && e.shiftKey)
           toggleEditMode()
         }}
        onChange={e => updateTask(task.id, e.target.value)}
        >
        </textarea>
      </div>)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={toggleEditMode}
         className="bg-mainBackgroundColor p-2.5 h-[100px] min-h[100px] items-center
    flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500
    cursor-grab relative task"
         key={task.id}
         onMouseEnter={() => {
           setMouseIsOver(true)
         }}
         onMouseLeave={() => {
           setMouseIsOver(false)
         }}>
      {/* Когда пользователь введет несколько строк, чтобы они отображались в несколько вводим p со стилями*/}
      <p className="
        my-auto h-[90%] w-full overflow-x-hidden overflow-y-auto whitespace-pre-wrap
      ">
        {task.content}
      </p>
      {mouseIsOver && <button className='stroke-white absolute right-4 top-1/2-translate-y-1/2
      bg-columnBackgroundColor p-2 rounded opacity-60 hover:opacity-100'
                              onClick={() => {
                                deleteTask(task.id)
                              }}>
        <TrashIcon/>
      </button>}
    </div>
  )
}