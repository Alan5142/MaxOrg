import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private http: HttpClient) { }

  getGroupDescription(groupId: string): Observable<string> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get(environment.apiUrl + 'groups/' + groupId + '/description', {headers: headers})
      .pipe(map<any, string>(value => {
        return value.description;
      }));
  }

  changeGroupDescription(groupId: string, newDescription: string): void {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    const url = environment.apiUrl + 'groups/' + groupId + '/description';
    this.http.post(url, {newDescription: newDescription}, {headers: headers}).subscribe(val => {});
  }
}
