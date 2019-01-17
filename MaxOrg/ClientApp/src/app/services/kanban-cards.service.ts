import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';

export interface KanbanCard {
  title: string;
  description: string;
  creationDate: Date;
}

export interface KanbanGroup {
  name: string;
  cards: KanbanCard[];
  color?: string;
}

export interface KanbanGroupMember {
  username: string;
  id: string;
}

export interface KanbanBoard {
  name: string;
  members: KanbanCardsService[];
  kanbanGroups: KanbanGroup[];
}

@Injectable({
  providedIn: 'root'
})
export class KanbanCardsService {

  boards: Observable<KanbanBoard[]>;

  constructor(private http: HttpClient) {
  }

  getBoardsOfGroup(groupId: string): Observable<KanbanBoard[]> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    this.boards =
      this.http.get(environment.apiUrl + 'groups/' + groupId + '/boards', {headers: headers}).pipe(map<any, KanbanBoard[]>(result => {
        return result.boards;
      }));
    this.boards.subscribe(result => {
      console.log(result);
    });
    return this.boards;
  }
}
