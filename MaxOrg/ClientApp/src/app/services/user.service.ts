import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Observable} from 'rxjs';

export interface User {
  key: string;
  username: string;
  password: string;
  email: string;
  description: string;
  occupation: string;
  birthday: Date;
}

export interface RegisterResponse {
  username: string;
  email: string;
  resourceLocation: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(environment.apiUrl + 'user/' + userId);
  }

  async register(userData: User) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    const response = await this.http.post(environment.apiUrl + 'user', userData, {headers: headers});
    console.log(response);
  }

  async existsUser(username: string): Promise<boolean> {
    const response = await this.http.get<User[]>(environment.apiUrl + 'users?name=' + username).toPromise();
    return response.length !== 0;
  }
}
