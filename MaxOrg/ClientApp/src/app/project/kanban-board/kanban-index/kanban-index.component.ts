import {Component, OnInit} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {KanbanBoardDescription, KanbanCardsService} from '../../../services/kanban-cards.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-kanban-index',
  templateUrl: './kanban-index.component.html',
  styleUrls: ['./kanban-index.component.scss']
})
export class KanbanIndexComponent implements OnInit {

  boards: Observable<KanbanBoardDescription[]>;
  projectId: string;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public mediaObserver: MediaObserver,
              private kanbanService: KanbanCardsService) {
    route.parent.parent.params.subscribe(params => {
      this.projectId = params['id'];
      this.boards = this.kanbanService.getBoardsOfGroup(this.projectId);
    });
  }

  ngOnInit() {
  }

  goToBoard(id: string) {
    this.router.navigate([id], {relativeTo: this.route});
  }
}
