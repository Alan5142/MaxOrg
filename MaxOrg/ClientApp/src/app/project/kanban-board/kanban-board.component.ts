import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard, KanbanCard, KanbanCardsService, KanbanGroup} from '../../services/kanban-cards.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {MediaObserver} from '@angular/flex-layout';
import {MatMenu, MatMenuTrigger} from '@angular/material';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  route: ActivatedRoute;
  board: Observable<KanbanBoard[]> = null;
  tracks: any[] = [
    {
      'title': 'Por hacer',
      'id': 'todo',
      'tasks': [
        {
          'id': 'first-task',
          'title': 'Tarea de ejemplo :)',
          'description': 'Texto de ejemplo'
        }
      ]
    },
    {
      'title': 'En progreso',
      'id': 'inprogress',
      'tasks': [
        {
          'id': 'second-task',
          'title': 'Tarea de ejemplo 2',
          'description': 'Texto de ejemplo'
        }
      ]
    },
    {
      'title': 'En pruebas',
      'id': 'ddone',
      'tasks': [
        {
          'id': 'third-task',
          'title': 'Tarea de ejemplo 3',
          'description': 'Texto de ejemplo'
        }
      ]
    },
    {
      'title': 'Finalizado',
      'id': 'qapass',
      'tasks': [
        {
          'id': 'fourth-task',
          'title': 'Tarea de ejemplo 4',
          'description': 'Texto de ejemplo'
        }
      ]
    }
  ];


  constructor(route: ActivatedRoute,
              public kanbanService: KanbanCardsService,
              mediaObserver: MediaObserver) {
    this.route = route;
    route.parent.params.subscribe(params => {
      this.board = this.kanbanService.getBoardsOfGroup(params['id']);
    });
  }

  ngOnInit() {

  }

  get trackIds(): string[] {
    return this.tracks.map(track => track.id);
  }

  get groupsIds(): Observable<string[]> {
    return this.board.pipe(map<KanbanBoard[], string[]>(result => {
      const r = result.map(group => group.name);
      console.log(r);
      return r;
    }));
  }

  onTaskDrop(event: CdkDragDrop<any[]>) {
    // In case the destination container is different from the previous container, we
    // need to transfer the given task to the target data array. This happens if
    // a task has been dropped on a different track.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  onTrackDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  }
}
