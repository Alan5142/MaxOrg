import {Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ProjectsService} from '../../../services/projects.service';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard, KanbanCardsService, KanbanGroup} from '../../../services/kanban-cards.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

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

  projectId: string;

  board: Observable<KanbanBoard> = null;
  groups: Observable<KanbanGroup[]>;

  constructor(private kanbanService: KanbanCardsService,
              private route: ActivatedRoute) {
    this.updateDate();
  }

  ngOnInit() {
  }

  get trackIds(): string[] {
    return this.tracks.map(track => track.id);
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

  private updateDate() {
    this.route.params.subscribe(params => {
      this.route.parent.parent.params.subscribe(parentParameters => {
        this.projectId = parentParameters['id'];
        this.board = this.kanbanService.getBoardData(this.projectId, params['boardId']);
        this.groups = this.board.pipe(map<KanbanBoard, KanbanGroup[]>(result => {
          return result.kanbanGroups;
        }));
      });
    });
  }

  getKanbanGroups(): Observable<KanbanGroup[]> {
    return this.board.pipe(map<KanbanBoard, KanbanGroup[]>(result => {
      console.log(result);
      return result.kanbanGroups;
    }));
  }
}
