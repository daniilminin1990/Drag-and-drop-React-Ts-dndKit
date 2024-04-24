import {TaskType} from "./types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {v1} from "uuid";
import {column1, column2} from "./columnsSlice";

const slice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [
      {id: v1(), columnId: column1, content: 'Task 1'},
      {id: v1(), columnId: column1, content: 'Task 2'},
      {id: v1(), columnId: column1, content: 'Task 3'},
      {id: v1(), columnId: column2, content: 'Task 4'},
      {id: v1(), columnId: column2, content: 'Task 5'},
    ] as TaskType[]
  },
  reducers: {
    addTask: (state, action: PayloadAction<TaskType>) => {
      console.log('Сколько',action.payload)
      state.tasks = [...state.tasks, action.payload]
    },
    deleteTask: (state, action: PayloadAction<string | number>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload)
    },
    updateTask: (state, action: PayloadAction<{id: string | number, content: string}>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id)
      state.tasks[index] = {...state.tasks[index], content: action.payload.content}
    },
    moveTask: (state, action: PayloadAction<{ activeTaskId: string | number, overTaskId: string | number | null }>) => {
      const { activeTaskId, overTaskId } = action.payload;
      const activeTaskIndex = state.tasks.findIndex(task => task.id === activeTaskId);
      const overTaskIndex = state.tasks.findIndex(task => task.id === overTaskId);

      if (activeTaskIndex < 0 || overTaskIndex < 0) return; // Прерываем, если индекс не найден

      // Удаляем активную задачу из массива
      const [activeTask] = state.tasks.splice(activeTaskIndex, 1);

      // Вставляем активную задачу на новое место
      state.tasks.splice(overTaskIndex, 0, activeTask);

      // Если задачи принадлежат разным колонкам, обновляем columnId активной задачи.
      if (activeTask.columnId !== state.tasks[overTaskIndex].columnId) {
        activeTask.columnId = state.tasks[overTaskIndex].columnId;
      }
    },
    moveTaskAcrossTodos: (state, action: PayloadAction<{ activeTaskId: string | number, overColumnId: string | number }>) => {
      const { activeTaskId, overColumnId } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === activeTaskId);

      if (taskIndex < 0) return; // Если не найдена задача с таким ID, ничего не делаем

      // Обновляем columnId задачи на ID колонки, над которой она была отпущена
      state.tasks[taskIndex].columnId = overColumnId;

    }
  }
})

export const tasksSlice = slice.reducer
export const tasksActions = slice.actions