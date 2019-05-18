import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface CreateTaskRequest{
  name:string;
  description:string;
  deliveryDate?:Date;
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

  getGroupTasks(groupId: string){
    const url= environment.apiUrl + 'groups/' + groupId + '/tasks';
    
    return this.http.get(url).pipe(map<Task[],any>(tasks=>{tasks.forEach(task => {
      task.creationDate=this.formatDate(task.creationDate);
    }); return tasks;}));
    
  
  }
  formatDate(dateToFormat:any){
    let date=new Date(Date.parse(dateToFormat));
    return (date.getDate()>9?"":"0")+date.getDate()+"/"+(date.getMonth()>8?"":"0")+(date.getMonth()+1)+"/"+date.getFullYear();
  }
}
