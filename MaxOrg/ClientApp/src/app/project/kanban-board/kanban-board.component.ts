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

  constructor(route: ActivatedRoute,
              public kanbanService: KanbanCardsService,
              mediaObserver: MediaObserver) {
    this.route = route;
  }

  ngOnInit() {

  }
}
