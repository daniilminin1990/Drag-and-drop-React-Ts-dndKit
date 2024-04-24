export type Column = {
  id: string;
  title: string
}

export type TaskType = {
  id: string;
  columnId: string;
  content: string
}