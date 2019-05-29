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
  repoUrl: string;
  devOps: boolean;
}

export interface CreateGroupData {
  currentGroupId:string;
  name: string;
  description:string;
  members: string[];
  subgroupAdminId:string;
}

export interface GetGroupMembersResponse {
  members: User[];
}

export interface EditGroupRequest {
  linkedRepositoryId?: number;
  name?: string;
  groupOwner?: string;
  description?: string
  readOnly?: boolean;
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

  createGroup(newGroupData: CreateGroupData) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.post(environment.apiUrl + 'groups', newGroupData, {headers: headers});
  }

  getMembers(groupId: string): Observable<GetGroupMembersResponse> {
    return this.http.get<GetGroupMembersResponse>(`${environment.apiUrl}groups/${groupId}/members`);
  }

  changeGroupInfo(groupId: string, editRequest: EditGroupRequest): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}groups/${groupId}`, editRequest);
  }

  linkToGitHub(groupId: string, id: number) {
    return this.http.put(`/api/groups/${groupId}/github/link`, {id: id});
  }

  getRepositoryCode(groupId: string, path: string = '/'): Observable<any[]> {
    if (path.trim() === '')
      path = '/';
    return this.http.get<any[]>(`/api/groups/${groupId}/github/code?path=${path}`);
  }

  getRepositoryIssues(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/groups/${groupId}/github/issues`);
  }

  getRepositoryCommits(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/groups/${groupId}/github/commits`);
  }

  uploadAttachment(groupId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`/api/groups/${groupId}/attachments`, formData, {
      reportProgress: true,
      observe: "events",
      headers: {'ngsw-bypass': ''}
    });
  }

  getAdminInfo(groupId: string): Observable<any> {
    return this.http.get(`/api/groups/${groupId}/admin-info`);
  }
}
