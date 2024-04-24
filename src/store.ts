import {configureStore} from "@reduxjs/toolkit";
import {columnsSlice} from "./columnsSlice";
import {tasksSlice} from "./tasksSlice";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";

export const store = configureStore({
  reducer: {
    tasks: tasksSlice,
    columns: columnsSlice,
  }
})

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootReducerType> =
  useSelector;

export type RootReducerType = ReturnType<typeof store.getState>