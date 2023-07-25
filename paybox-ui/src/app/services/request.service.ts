import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Todo} from '../todo';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  baseURL = 'http://localhost:3000';
  constructor(private http: HttpClient) { }


  async getAllTodos(): Promise<Todo[]> {
    return await lastValueFrom(this.http.get(this.baseURL + "/todos")) as Todo[];
  }
  async addTodo(obj: Todo):Promise<any>{
    return this.http.post(this.baseURL+"/todos", obj).toPromise();
  }
  async editTodo(obj: Todo):Promise<any>{
        return this.http.put( `${this.baseURL}/todos/${obj.todo_id}`, obj).toPromise();
  }
  async deleteTodo(obj: Todo):Promise<any>{
        return this.http.delete( `${this.baseURL}/todos/${obj.todo_id}`).toPromise();
  }

}
