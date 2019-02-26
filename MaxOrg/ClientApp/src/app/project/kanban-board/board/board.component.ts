import {Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard, KanbanCardsService, KanbanGroup} from '../../../services/kanban-cards.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {MatDialog} from '@angular/material';
import {CreateCardComponent} from './create-card/create-card.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  projectId: string;
  boardId: string;

  board: Observable<KanbanBoard> = null;
  groups: Observable<KanbanGroup[]>;

  constructor(private kanbanService: KanbanCardsService,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
    this.updateData();
  }

  onTaskDrop(event: CdkDragDrop<any[]>) {
    console.log(event);
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

  ngOnInit() {
  }

  private updateData() {
    this.route.params.subscribe(params => {
      this.route.parent.parent.params.subscribe(parentParameters => {
        this.projectId = parentParameters['id'];
        this.boardId = params['boardId'];
        this.board = this.kanbanService.getBoardData(this.projectId, this.boardId);
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

  addCardToSection(id: string) {
    this.dialog.open(CreateCardComponent, {data: {groupId: this.projectId, boardId: this.boardId, sectionId: id}})
      .afterClosed()
      .subscribe(result => {
        if (result === undefined) {
          return;
        }
        switch (result.valid) {
          case true:
            this.updateData();
            break;
          case false:
            alert('No se pudo crear la tarjeta');
            break;
        }
      });
  }
}
