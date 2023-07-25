import {Component, OnInit, TestabilityRegistry} from '@angular/core';
import {Todo} from './todo';
import {RequestService} from './services/request.service';
import {FormControl, FormGroup} from '@angular/forms';
import {NotificationsService} from './services/notifications.service';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private requestService: RequestService,private notificationsService: NotificationsService,private snackBar: MatSnackBar,) {
    this.addTodoForm = new FormGroup({
      addTitle: new FormControl(),
      addContent: new FormControl(),
      addDate: new FormControl()
    });

    this.editTodoForm = new FormGroup({
      editTitle: new FormControl(),
      editContent: new FormControl(),
      editDate: new FormControl()
    });
  }
  todos: Todo[] = [];
  notifications: Todo[] = [];
  editTodoForm: FormGroup;
  addTodoForm: FormGroup;
  showAddForm:boolean = false;




  async getAllTodos() {

    const response = await this.requestService.getAllTodos();
    console.log('getAllTodos');
    this.todos = response;
  }

  async addTodo(todo: Todo) {
    await this.requestService.addTodo(todo);

  }

  async deleteTodo(todo: Todo) {
    await this.requestService.deleteTodo(todo);
    await this.getAllTodos();
  }

  editTodo(todo: Todo) {
    this.todos.forEach(t => t.isEditing = t === todo);
    console.log(todo.isEditing)
    console.log(this.todos)

  }
  cancelEditTodo(todo: Todo) {
    this.todos.filter(t =>  {if(t === todo) t.isEditing=false});
    console.log(todo.isEditing)
  }

  async saveEditedTodo(todo: Todo) {
    this.todos.filter(t =>  {if(t === todo) delete t.isEditing});
    if (this.editTodoForm.valid) {
      console.log(this.editTodoForm.value);
      const { editTitle, editContent, editDate } = this.editTodoForm.value;
      const editedTodo:Todo = {...todo,title:editTitle, content:editContent,deadline:editDate}
      console.log(editedTodo)
      await this.requestService.editTodo(editedTodo);
    }
    this.editTodoForm.reset();
    this.editTodoForm.setErrors(null);
    this.getAllTodos()

  }

  extendAddform(){
    this.showAddForm=!this.showAddForm;
  }
  async saveAddTodo() {
    if (this.addTodoForm.valid) {
      console.log(this.addTodoForm.value);
      const { addTitle, addContent, addDate } = this.addTodoForm.value;
      const todo:Todo = {title:addTitle, content:addContent,deadline:addDate}
      await this.addTodo(todo);
      console.log(addTitle, addContent, addDate)
    }
    this.addTodoForm.reset();
    this.addTodoForm.setErrors(null);
    this.getAllTodos()
    this.showAddForm=false
  }

  ngOnInit(): void {
    this.getAllTodos()
    this.getAllNotifications().then((value)=>this.showNotifications(value));


  }

  cancelAddTodo() {
   this.extendAddform();
    this.editTodoForm.reset();
    this.editTodoForm.setErrors(null);
  }
  async getAllNotifications():Promise<Todo[]>{
    const response  = await this.notificationsService.getAllNotifications();
    this.notifications=response;
    return response;
  }
  displayNotification(message: string,config:MatSnackBarConfig) {
    this.snackBar.open(message, 'Close', config);}

  private configSuccess: MatSnackBarConfig = {
    panelClass: ['snack-bar-success'],
    duration : 5000,

  };


  showNotifications(notifications: Todo[]) {
    if (notifications.length === 0) {
      return;
    }
    const notification = notifications[0];
    const snackBarRef = this.snackBar.open(`${notification.title} is about to get to deadline`, 'Dismiss', {
      panelClass: ['snack-bar-success'],duration: 5000
    });
    snackBarRef.afterDismissed().subscribe(() => {
      notifications.shift();
      setTimeout(() => this.showNotifications(notifications), 500);
    });
  }



}
