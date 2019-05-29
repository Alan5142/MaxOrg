import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {KanbanBoard, KanbanBoardDescription} from './kanban-cards.service';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  creationDate: Date;
}

export interface KanbanGroup {
  id: string;
  name: string;
  cards: KanbanCard[];
  color?: string;
}

export enum KanbanMemberPermissions {
  Admin,
  Write,
  Read
}

export interface KanbanGroupMember {
  userId: string;
  memberPermissions: KanbanMemberPermissions;
  user?: string;
}

export interface KanbanBoard {
  id: string;
  creationDate: Date;
  name: string;
  members: KanbanGroupMember[];
  kanbanGroups: KanbanGroup[];
  canEdit: boolean;
  isAdmin: boolean;
}

export interface KanbanBoardDescription {
  id: string;
  name: string;
}

export interface CreateCardRequest {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class KanbanCardsService {

  constructor(private http: HttpClient) {
  }

  getBoardsOfGroup(groupId: string): Observable<KanbanBoardDescription[]> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get(environment.apiUrl + 'groups/' + groupId + '/boards',
      {headers: headers}).pipe(map<any, KanbanBoardDescription[]>(result => {
      return result.boards;
    }));
  }

  getBoardData(groupId: string, boardId: string): Observable<KanbanBoard> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get<KanbanBoard>(environment.apiUrl + 'groups/' + groupId + '/boards/' + boardId, {headers: headers});
  }

  createBoard(groupId: string, boardName: string): Observable<any> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.post(environment.apiUrl + 'groups/' + groupId + '/boards', {name: boardName}, {headers: headers});
  }


  createCardInSection(groupId: string, boardId: string, sectionId: string, cardData: CreateCardRequest) {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.post(environment.apiUrl + `groups/${groupId}/boards/${boardId}/sections/${sectionId}/cards`,
      cardData, {headers: headers});
  }

  editGroupInfo(groupId: string, boardId: string, sectionId: string, newData: KanbanGroup): Observable<void> {
    const headers = new HttpHeaders().append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.put<void>(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections/${sectionId}`,
      newData, {headers: headers});
  }

  moveCard(groupId: string, boardId: string, sectionId: string, cardId: string, newSectionId: string, newIndex: number) {
    return this.http.put<void>(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections/${sectionId}/cards/${cardId}`,
      {
        newSectionId: newSectionId,
        newIndex: newIndex
      });
  }

  createSection(groupId: string, boardId: string, name: string) {
    return this.http.post<void>(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections`, {name: name});
  }

  deleteSection(groupId: string, boardId: string, sectionId: string) {
    return this.http.delete<void>(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections/${sectionId}`);
  }

  swapCards(groupId: string, boardId: string, sectionId: string, previousIndex: number, newIndex: number) {
    return this.http.put<void>(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections/${sectionId}/cards/swap`, {
      previousIndex: previousIndex,
      newIndex: newIndex
    })
  }

  deleteCard(groupId: string, boardId: string, sectionId: string, cardId: string) {
    return this.http.delete(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections/${sectionId}/cards/${cardId}`);
  }

  updateCard(groupId: string, boardId: string, sectionId: string, cardId: string, card: KanbanCard) {
    return this.http.patch(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/sections/${sectionId}/cards/${cardId}`, card);
  }

  addMembersToKanban(groupId: string, boardId: string, newMembers: KanbanGroupMember[]) {
    return this.http.post(`${environment.apiUrl}groups/${groupId}/boards/${boardId}/members`, {membersToEdit: newMembers});
  }
}
