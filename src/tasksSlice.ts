import {Column, TaskType} from "./types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {v1} from "uuid";
import {column1, column2, column3, columnsActions} from "./columnsSlice";
import {DragOverEvent} from "@dnd-kit/core";

export type TaskStateType = {
  tasks: {
    [key: string]: TaskType[]
  }
}

const slice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: {
      [column1]:
        [
          {id: v1(), columnId: column1, content: 'Task 1'},
          {id: v1(), columnId: column1, content: 'Task 2'},
          {id: v1(), columnId: column1, content: 'Task 3'},
        ],
      [column2]: [
        {id: v1(), columnId: column2, content: 'Task 4'},
        {id: v1(), columnId: column2, content: 'Task 5'},
      ],
      [column3]: [
        {id: v1(), columnId: column3, content: 'Task 6'}
      ]
    }
  } as TaskStateType,
  reducers:
    {
      addTask: (state, action: PayloadAction<{ colId: string, task: TaskType }>) => {
        const {colId, task} = action.payload
        console.log('Сколько', action.payload)
        state.tasks[colId] = [...state.tasks[colId], task]
      },
      deleteTask:
        (state, action: PayloadAction<{ colId: string, taskId: string }>) => {
          const {colId, taskId} = action.payload
          state.tasks[colId] = state.tasks[colId].filter(task => task.id !== taskId)
        },
      updateTask:
        (state, action: PayloadAction<{ colId: string, taskId: string, content: string }>) => {
          const {colId, taskId, content} = action.payload
          const index = state.tasks[colId].findIndex(task => task.id === taskId)
          state.tasks[colId][index] = {...state.tasks[colId][index], content: content}
        },
      moveTask: (state, action: PayloadAction<{
        colId: string,
        activeTaskId: string,
        overTaskId: string | null,
      }>) => {
        const {colId, activeTaskId, overTaskId} = action.payload;
        console.log(colId);

        const activeTaskIndex = state.tasks[colId].findIndex(task => task.id === activeTaskId);
        const overTaskIndex = state.tasks[colId].findIndex(task => task.id === overTaskId);


        if(activeTaskIndex !== -1 && overTaskIndex !== -1) {
          // Удаляем из старого места
          const activeTask = state.tasks[colId].splice(activeTaskIndex, 1)[0];

          // Вставляем активную задачу на новое место
          state.tasks[colId].splice(overTaskIndex, 0, activeTask);
        }
      },
      moveTaskToAnotherTodoOverTask:
        (state, action: PayloadAction<{
          activeColId: string,
          overColId: string,
          activeTaskId: string,
          overTaskId: string | null,
        }>) => {
          const {activeColId, overColId, activeTaskId, overTaskId} = action.payload;
          const activeTaskIndex = state.tasks[activeColId].findIndex(task => task.id === activeTaskId)
          const overTaskIndex = state.tasks[overColId].findIndex(task => task.id === overTaskId);

          // // Удаляем активную задачу из массива
          const [activeTask] = state.tasks[activeColId].splice(activeTaskIndex, 1);

          // Если задачи принадлежат разным колонкам, обновляем columnId активной задачи.
          activeTask.columnId = state.tasks[overColId][overTaskIndex].columnId;
          // Вставляем активную задачу на новое место
          state.tasks[overColId].splice(overTaskIndex, 0, activeTask);
        },
      moveTaskAcrossTodos:
        (state, action: PayloadAction<{
          colId: string
          activeTaskId: string,
          overColumnId: string
        }>) => {
          const {colId, activeTaskId, overColumnId} = action.payload;
          const taskIndex = state.tasks[colId].findIndex(task => task.id === activeTaskId);

          if (taskIndex < 0) return; // Если не найдена задача с таким ID, ничего не делаем

          // Обновляем columnId задачи на ID колонки, над которой она была отпущена
          state.tasks[colId][taskIndex].columnId = overColumnId;

        },
      moveTaskCombined:
        (state, action: PayloadAction<{
          tasks: TaskStateType,
          activeColId: string,
          overColId: string,
          activeId: string,
          overId: string,
          isOverATask: boolean,
          isOverAColumn: boolean
        }>) => {
          const {tasks, activeColId, overColId, activeId, overId, isOverATask, isOverAColumn} = action.payload;
          console.log(tasks)
          console.log(activeColId)
          console.log(tasks.tasks[activeColId])
          // const activeTaskIndex = tasks.tasks[activeColId].findIndex(task => task.id === activeId);
          // if (activeTaskIndex < 0) return; // Прерываем, если индекс не найден

          if (isOverATask) {
            console.log(tasks)
            console.log(activeColId)
            console.log(tasks.tasks[activeColId])
            const activeTaskIndex = tasks.tasks[activeColId].findIndex(task => task.id === activeId);
            if (activeTaskIndex < 0) return; // Прерываем, если индекс не найден
            const overTaskIndex = state.tasks[overColId].findIndex(task => task.id === overId);
            // Удаляем активную задачу из массива
            const [activeTask] = state.tasks[activeColId].splice(activeTaskIndex, 1);
            // Вставляем активную задачу на новое место
            state.tasks[overColId].splice(overTaskIndex, 0, activeTask);
            // Если задачи принадлежат разным колонкам, обновляем columnId активной задачи.
            if (activeTask.columnId !== state.tasks[overColId][overTaskIndex].columnId) {
              activeTask.columnId = state.tasks[overColId][overTaskIndex].columnId;
            }
          }

          if (isOverAColumn) {
            const activeTaskIndex = tasks.tasks[activeColId].findIndex(task => task.id === activeId);
            if (activeTaskIndex < 0) return; // Прерываем, если индекс не найден
            // Обновляем columnId задачи на ID колонки, над которой она была отпущена
            state.tasks[activeColId][activeTaskIndex].columnId = overId;
          }
        }
    },
  extraReducers: builder => {
    builder.addCase(columnsActions.addColumn, (state, action) => {
      state.tasks[action.payload.id] = []
    })
  }
})

export const tasksSlice = slice.reducer
export const tasksActions = slice.actions