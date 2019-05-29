import {Component, OnInit} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {KanbanBoardDescription, KanbanCardsService} from '../../../services/kanban-cards.service';
import {ActivatedRoute, Router} from '@angular/router';
import {merge, Observable} from 'rxjs';
import {shareReplay} from "rxjs/operators";
import {MatSnackBar} from "@angular/material";
import {ReadOnlyService} from "../../services/read-only.service";

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
              private snackBar: MatSnackBar,
              public mediaObserver: MediaObserver,
              private kanbanService: KanbanCardsService,
              public readOnly: ReadOnlyService) {
    route.parent.parent.params.subscribe(params => {
      this.projectId = params['id'];
      this.boards = this.kanbanService.getBoardsOfGroup(this.projectId).pipe(shareReplay(1));
    });
  }

  ngOnInit() {
  }

  goToBoard(id: string) {
    this.router.navigate([id], {relativeTo: this.route});
  }

  createBoardWithName(value: string) {
    if (value.length < 6 || value.length > 15) return;
    this.kanbanService.createBoard(this.projectId, value).subscribe(ok => {
      this.boards = merge(this.boards, this.kanbanService.getBoardsOfGroup(this.projectId).pipe(shareReplay(1)));
      this.snackBar.open('Creado con exito', 'OK', {duration: 2000});
    }, err => {
      this.snackBar.open('No se pudo crear', 'OK', {duration: 2000});
    });
  }
}
