import {Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard, KanbanCard, KanbanCardsService, KanbanGroup} from '../../../services/kanban-cards.service';
import {merge, Observable, Subject} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CreateCardComponent} from './create-card/create-card.component';
import {EditSectionComponent} from './edit-section/edit-section.component';
import {CreateSectionComponent} from './create-section/create-section.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  projectId: string;
  boardId: string;

  board: Observable<KanbanBoard> = null;
  groups: Observable<KanbanGroup[]> = null;

  constructor(private kanbanService: KanbanCardsService,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
    this.updateData();
  }

  onTaskDrop(event: CdkDragDrop<any[]>) {
    // In case the destination container is different from the previous container, we
    // need to transfer the given task to the target data array. This happens if
    // a task has been dropped on a different track.
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const itemId = event.previousContainer.data[0].id;
      const previousContainerId = event.previousContainer.id;
      const newContainerId = event.container.id;
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      this.kanbanService.moveCard(this.projectId,
        this.boardId,
        previousContainerId,
        itemId,
        newContainerId).subscribe(_ => {}, error => {
          this.updateData();
          this.snackBar.open('No se pudo mover', 'OK', {duration: 2000});
      });
    }
  }

  ngOnInit() {
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
            this.snackBar.open('No se pudo crear la tarjeta', 'OK', {duration: 2000});
            break;
        }
      });
  }

  private updateData() {
    this.route.params.subscribe(params => {
      this.route.parent.parent.params.subscribe(parentParameters => {
        this.projectId = parentParameters['id'];
        this.boardId = params['boardId'];
        this.board = this.kanbanService.getBoardData(this.projectId, this.boardId).pipe(shareReplay(1));
        this.groups = this.board.pipe(map<KanbanBoard, KanbanGroup[]>(result => {
          return result.kanbanGroups;
        })).pipe(shareReplay(1));
      });
    });
  }

  trackUsingId(index, task: KanbanCard): string {
    return task.id;
  }

  editSection(group: KanbanGroup) {
    const dialog = this.dialog.open(EditSectionComponent, {data: group});
    dialog.afterClosed().subscribe(result => {
      if (result === null || result === undefined) {
        return;
      }
      this.kanbanService.editGroupInfo(this.projectId, this.boardId, group.id, result as KanbanGroup)
        .subscribe(() => this.snackBar.open('Editado con exito', 'OK', {duration: 2000}),
          error => {
            this.snackBar.open('No se pudo editar', 'OK', {duration: 2000});
            console.log(error);
          });
    });
  }

  createSection() {
    const dialog = this.dialog.open(CreateSectionComponent);
    dialog.afterClosed().subscribe(result => {
      if (result === undefined) { return; }
      this.kanbanService.createSection(this.projectId, this.boardId, result.sectionName).subscribe(_ => {
        this.updateData();
        this.snackBar.open('Se creo con exito la sección', 'OK', {duration: 2000});
      }, _ => {
        this.snackBar.open('No se pudo crear la sección', 'OK', {duration: 2000});
      });
    });
  }
}
