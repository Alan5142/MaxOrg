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
}

interface ProjectResponse {
  projects: Project[];
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
    console.log(headers);
    return this.http.post(environment.apiUrl + 'projects', newProjectData, {headers: headers}).pipe(map<any, boolean>(response => {
      console.log(response);
      return !!response;
    }));
  }
}
