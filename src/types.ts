export type Column = {
  id: string | number;
  title: string
}

export type TaskType = {
  id: string | number;
  columnId: string | number;
  content: string
}