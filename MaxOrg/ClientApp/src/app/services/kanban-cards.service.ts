import {Injectable} from '@angular/core';

export interface KanbanCard {
  id: number;
  title: string;
  description: string;
}

export interface KanbanGroup {
  id: number;
  name: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: number;
  groupName: string;
  cardGroups: KanbanGroup[];
}

@Injectable({
  providedIn: 'root'
})
export class KanbanCardsService {

  boards: KanbanBoard[];

  constructor() {
    this.boards = [];
    this.boards.push({id: 0, groupName: Math.random().toString(36).substring(7), cardGroups: []});

    let cards: KanbanCard[] = [{id: 0, title: 'Titulo', description: Math.random().toString(36).substring(7)},
      {id: 1, title: 'Titulo', description: Math.random().toString(36).substring(7)}];

    this.boards[0].cardGroups.push({id: 0, name: Math.random().toString(36).substring(7), cards: cards});

    cards = [{id: 2, title: 'Titulo', description: Math.random().toString(36).substring(7)},
      {id: 3, title: 'Titulo', description: Math.random().toString(36).substring(7)}];

    this.boards[0].cardGroups.push({id: 1, name: Math.random().toString(36).substring(7), cards: cards});
  }

  getKanbanBoardById(id: number): KanbanBoard {
    return this.boards[id];
  }

}
