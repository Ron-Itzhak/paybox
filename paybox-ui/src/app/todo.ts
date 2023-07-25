export interface Todo {
  todo_id?:number
  title: string,
  content: string,
  deadline?:Date,
  isEditing?:boolean
}
