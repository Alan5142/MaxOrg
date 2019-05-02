import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface CreateTaskRequest{
  name:string;
  description:string;
  referenceRequirement?:string;
  referenceTask?:string;
  contributionPercentage?:string;
}
export interface Task{
  key:string;
  id:string;
  name:string;
  description:string;
  creationDate:any;//C# DateTime type
  progress:number;
}
export interface response{
  tasks:Task[];
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private http: HttpClient) { }

  createGroupTask(groupId:string,task:CreateTaskRequest){
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    const url = environment.apiUrl + 'groups/' + groupId + '/tasks';
    return this.http.post(url, task, {headers: headers}).pipe(map<any, boolean>(response => {
      return response;
    }));
  }

  getGroupTasks(groupId: string):Observable<Task[]>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'});
    return this.http.get(`${environment.apiUrl}groups/${groupId}/tasks`,  {headers: headers})
      .pipe(map<response,Task[]>(response=>{
        console.log(response);
        if(response){
          return [{key:"",
            id:"",
            name:"",
            description:"",
            creationDate:"",//C# DateTime type
            progress:99}];
        }
        return [];
      }))
  }
}
