import {Column, TaskType} from "./types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {v1} from "uuid";
import {column1, column2} from "./columnsSlice";
import {DragOverEvent} from "@dnd-kit/core";

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
      console.log('Сколько', action.payload)
      state.tasks = [...state.tasks, action.payload]
    },
    deleteTask: (state, action: PayloadAction<{ taskId: string }>) => {
      const {taskId} = action.payload
      state.tasks = state.tasks.filter(task => task.id !== taskId)
    },
    updateTask: (state, action: PayloadAction<{ taskId: string, content: string }>) => {
      const {taskId, content} = action.payload
      const index = state.tasks.findIndex(task => task.id === taskId)
      state.tasks[index] = {...state.tasks[index], content: content}
    },
    moveTask: (state, action: PayloadAction<{ activeTaskId: string, overTaskId: string | null }>) => {
      const {activeTaskId, overTaskId} = action.payload;
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
    moveTaskAcrossTodos: (state, action: PayloadAction<{
      activeTaskId: string,
      overColumnId: string
    }>) => {
      const {activeTaskId, overColumnId} = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === activeTaskId);

      if (taskIndex < 0) return; // Если не найдена задача с таким ID, ничего не делаем

      // Обновляем columnId задачи на ID колонки, над которой она была отпущена
      state.tasks[taskIndex].columnId = overColumnId;

    },
    moveTaskCombined: (state, action: PayloadAction<{ activeId: string, overId: string, isOverATask: boolean, isOverAColumn: boolean }>) => {
      const { activeId, overId, isOverATask, isOverAColumn } = action.payload;
      const activeTaskIndex = state.tasks.findIndex(task => task.id === activeId);
      if (activeTaskIndex < 0) return; // Прерываем, если индекс не найден

      if (isOverATask) {
        const overTaskIndex = state.tasks.findIndex(task => task.id === overId);
        // Удаляем активную задачу из массива
        const [activeTask] = state.tasks.splice(activeTaskIndex, 1);
        // Вставляем активную задачу на новое место
        state.tasks.splice(overTaskIndex, 0, activeTask);
        // Если задачи принадлежат разным колонкам, обновляем columnId активной задачи.
        if (activeTask.columnId !== state.tasks[overTaskIndex].columnId) {
          activeTask.columnId = state.tasks[overTaskIndex].columnId;
        }
      }

      if (isOverAColumn) {
        // Обновляем columnId задачи на ID колонки, над которой она была отпущена
        state.tasks[activeTaskIndex].columnId = overId;
      }
    }
  }
})

export const tasksSlice = slice.reducer
export const tasksActions = slice.actions