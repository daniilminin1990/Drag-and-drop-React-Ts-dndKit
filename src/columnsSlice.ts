import {Column} from "./types";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {v1} from "uuid";

export const column1= v1()
export const column2= v1()
export const column3= v1()

const slice = createSlice({
  name: 'columns',
  initialState: {
    columns: [
      {id: column1, title: 'Column 1'},
      {id: column2, title: 'Column 2'},
      {id: column3, title: 'Column 3'},
    ] as Column[]
  },
  reducers: {
    addColumn: (state, action:PayloadAction<Column>) => {
      console.log('11')
      state.columns.push(action.payload)
    },
    updateColumn: (state, action: PayloadAction<{ id: string, title: string }>) => {
      const index = state.columns.findIndex(column => column.id === action.payload.id)
      state.columns[index] = action.payload
    },
    deleteColumn: (state, action: PayloadAction<string>) => {
      const index = state.columns.findIndex(column => column.id === action.payload)
      state.columns.splice(index, 1)
    },
    moveColumn: (state, action: PayloadAction<{ fromColumnId: string, toColumnId: string }>) => {
      const { fromColumnId, toColumnId } = action.payload
      const fromColumnIndex = state.columns.findIndex(column => column.id === fromColumnId)
      const toColumnIndex = state.columns.findIndex(column => column.id === toColumnId)

      const fromColumn = state.columns[fromColumnIndex]
      state.columns.splice(fromColumnIndex, 1)
      state.columns.splice(toColumnIndex, 0, fromColumn)
    }
  }
})

export const columnsActions = slice.actions
export const columnsSlice = slice.reducer