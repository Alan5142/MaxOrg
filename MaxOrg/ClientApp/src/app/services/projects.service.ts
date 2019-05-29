import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';

export interface Project {
  id: string;
  name: string;
  description?: string;
  projectOwner?: string;
  creationDate: Date;
}

export interface CreateProjectData {
  name: string;
  members: string[];
  previousProject?: string;
}

export interface ProjectResponse {
  projects: Project[];
}

export enum RequirementType {
  Functional,
  NonFunctional
}

export interface Requirement {
  id: string;
  description: string;
  creationDate: Date;
  requirementType: RequirementType;
  progress?:number;
}

export interface CreateRequirementRequest {
  description: string;
  type: RequirementType;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(private http: HttpClient) {
  }

  getProjects(): Observable<Project[]> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));

    return this.http.get<ProjectResponse>(environment.apiUrl + 'projects', {headers: headers})
      .pipe(map<ProjectResponse, Project[]>(response => {
        if (response) {
          return response.projects;
        }
        return [];
      }));
  }

  getProject(projectId:string): Observable<Project> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get(environment.apiUrl + 'Projects/' + projectId, {headers: headers})
      .pipe(map<any, Project>(value => {
        return value;
      }));
  }

  createProject(newProjectData: CreateProjectData): Observable<boolean> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.post(environment.apiUrl + 'projects', newProjectData, {headers: headers}).pipe(map<any, boolean>(response => {
      console.log(response);
      return !!response;
    }));
  }

  createRequirement(projectId: string, request: CreateRequirementRequest): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'});
    return this.http.post<void>(`${environment.apiUrl}projects/${projectId}/requirements`, request, {headers: headers});
  }

  getProjectRequirements(projectId: string): Observable<Requirement[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'});
    return this.http.get<Requirement[]>(`${environment.apiUrl}projects/${projectId}/requirements`,  {headers: headers});
  }

  deleteProjectRequirement(projectId: string, requirementId: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'});
    return this.http.delete<void>(`${environment.apiUrl}projects/${projectId}/requirements/${requirementId}`,
      {headers: headers});
  }
  getRequirementProgress(projectId,requirementId){
    const url=environment.apiUrl+'projects/'+projectId+'/requirements/'+requirementId+'/progress';
    return this.http.get(url);
    //return of(80);
  }
  modifyProjectRequirement(projectId: string, requirementId: string, newDescription: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'});
    return this.http.put<void>(`${environment.apiUrl}projects/${projectId}/requirements/${requirementId}`,
      {description: newDescription},
      {headers: headers});
  }

  getAllUsersOfProject(projectOrGroupId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}projects/${projectOrGroupId}/members`);
  }

  setReadOnly(projectId: string): Observable<void> {
    return this.http.put<void>(`/api/projects/${projectId}/finish`, {});
  }
}
