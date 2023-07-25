import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Todo} from '../todo';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  baseURL = 'http://localhost:4000';
  constructor(private http: HttpClient) { }

  async getAllNotifications(): Promise<Todo[]> {
    return await lastValueFrom(this.http.get(this.baseURL + "/sendNotifications")) as Todo[];
  }

}
