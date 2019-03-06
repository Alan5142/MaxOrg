import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard} from '../../services/kanban-cards.service';
import {MediaObserver} from '@angular/flex-layout';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  route: ActivatedRoute;
  board: Observable<KanbanBoard[]> = null;

  constructor(route: ActivatedRoute,
              mediaObserver: MediaObserver) {
    this.route = route;
  }

  ngOnInit() {

  }
}
