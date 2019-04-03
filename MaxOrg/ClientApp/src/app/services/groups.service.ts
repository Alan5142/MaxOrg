import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {User} from "./user.service";

export interface GroupInfo {
  name: string;
  key: string;
  groupOwner: string;
  creationDate: Date;
  members: User[];
}

export interface CreateGroupData {
  currentGroupId:string;
  name: string;
  description:string;
  members: string[];
  subgroupAdminId:string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private http: HttpClient) {
  }

  getGroupInfo(groupId: string): Observable<GroupInfo> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get<GroupInfo>(`${environment.apiUrl}groups/${groupId}`, {headers: headers});
  }

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
    this.http.post(url, {newDescription: newDescription}, {headers: headers}).subscribe(val => {
    });
  }

  createGroup(newGroupData: CreateGroupData): Observable<boolean> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.post(environment.apiUrl + 'groups', newGroupData, {headers: headers}).pipe(map<any, boolean>(response => {
      return response;
    }));
  }

}
