import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard, KanbanCard, KanbanCardsService, KanbanGroup} from '../../../services/kanban-cards.service';
import {merge, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CreateCardComponent} from './create-card/create-card.component';
import {EditSectionComponent} from './edit-section/edit-section.component';
import {CreateSectionComponent} from './create-section/create-section.component';
import {DeleteSectionComponent} from "./delete-section/delete-section.component";
import * as signalR from "@aspnet/signalr";
import {CardDetailedComponent} from "./card-detailed/card-detailed.component";
import {MediaObserver} from "@angular/flex-layout";
import {ModifyMembersComponent} from "../modify-members/modify-members.component";
import {UserService} from "../../../services/user.service";
import {GroupsService} from "../../../services/groups.service";
import {ReadOnlyService} from "../../services/read-only.service";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit, OnDestroy {
  connection: signalR.HubConnection;
  projectId: string;
  boardId: string;
  canEdit: boolean;

  board: Observable<KanbanBoard> = null;
  groups: Observable<KanbanGroup[]> = null;

  constructor(private kanbanService: KanbanCardsService,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private userService: UserService,
              private groupService: GroupsService,
              private mediaObserver: MediaObserver,
              public readOnly: ReadOnlyService) {
  }

  onTaskDrop(event: CdkDragDrop<any[]>) {
    // In case the destination container is different from the previous container, we
    // need to transfer the given task to the target data array. This happens if
    // a task has been dropped on a different track.
    if (event.previousContainer === event.container) {
      this.kanbanService.swapCards(this.projectId,
        this.boardId,
        event.container.id,
        event.previousIndex,
        event.currentIndex)
        .subscribe(() => {
          this.updateData();
        }, () => {
          this.snackBar.open('No se pudo mover', 'OK', {duration: 2000});
        });
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const itemId = event.previousContainer.data[event.previousIndex].id;
      const previousContainerId = event.previousContainer.id;
      const newContainerId = event.container.id;
      const newIndex = event.currentIndex;

      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      this.kanbanService.moveCard(this.projectId,
        this.boardId,
        previousContainerId,
        itemId,
        newContainerId,
        newIndex)
        .subscribe(_ => {
          this.updateData()
        }, error => {
          this.updateData();
          this.snackBar.open('No se pudo mover', 'OK', {duration: 2000});
        });
    }
  }

  ngOnInit() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/kanban-hub', {accessTokenFactory: () => this.userService.userToken})
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.connection.on("UpdateBoard", () => {
      this.updateData();
    });

    this.connection.start().then(() => this.connection.send('JoinGroup', {
      groupId: this.projectId,
      boardId: this.boardId
    }));

    this.updateData();
  }

  ngOnDestroy(): void {
    this.connection.stop().then(() => {
    });
  }

  getKanbanGroups(): Observable<KanbanGroup[]> {
    return this.board.pipe(map<KanbanBoard, KanbanGroup[]>(result => {
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

  public updateData() {
    this.route.params.subscribe(params => {
      this.route.parent.parent.params.subscribe(parentParameters => {
        this.projectId = parentParameters['id'];
        this.boardId = params['boardId'];
        if (this.board === null) {
          this.board = this.kanbanService.getBoardData(this.projectId, this.boardId).pipe(shareReplay(1));
        } else {
          this.board = merge(this.board, this.kanbanService.getBoardData(this.projectId, this.boardId).pipe(shareReplay(1)));
        }

        this.board.subscribe(b => this.canEdit = b.canEdit);

        this.groups = this.board.pipe(shareReplay(1)).pipe(map<KanbanBoard, KanbanGroup[]>(result => {
          return result.kanbanGroups;
        }));
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
          });
    });
  }

  createSection() {
    const dialog = this.dialog.open(CreateSectionComponent);
    dialog.afterClosed().subscribe(result => {
      if (result === undefined) {
        return;
      }
      this.kanbanService.createSection(this.projectId, this.boardId, result.sectionName).subscribe(_ => {
        this.updateData();
        this.snackBar.open('Se creo con exito la sección', 'OK', {duration: 2000});
      }, _ => {
        this.snackBar.open('No se pudo crear la sección', 'OK', {duration: 2000});
      });
    });
  }

  deleteSection(group: KanbanGroup) {
    const dialog = this.dialog.open(DeleteSectionComponent);
    dialog.afterClosed().subscribe(result => {
      if (result.delete) {
        this.kanbanService.deleteSection(this.projectId, this.boardId, group.id).subscribe(() => {
          this.updateData();
          this.snackBar.open('Eliminado con éxito', 'OK', {duration: 2000});
        }, () => {
          this.snackBar.open('No se pudo eliminar', 'OK', {duration: 2000});
        });
      }
    });
  }

  showDetailedInfo(task: KanbanCard, group: KanbanGroup) {
    const dialog = this.dialog.open(CardDetailedComponent, {
      data: {
        task: task,
        canEdit: this.canEdit
      },
      width: this.mediaObserver.isActive('lt-md') ? '95%' : '60%'
    });
    dialog.afterClosed().subscribe(modifyOptions => {
      if (modifyOptions !== undefined && modifyOptions.shouldDelete) {
        this.kanbanService.deleteCard(this.projectId, this.boardId, group.id, task.id).subscribe(ok => {
          this.updateData();
          this.snackBar.open('Tarjeta eliminada con exito', 'OK', {duration: 2000});
        }, error => {
          this.snackBar.open('No se pudo eliminar la tarjeta', 'OK', {duration: 2000});
        });
      } else if (this.canEdit && modifyOptions !== undefined && modifyOptions.shouldModify) {
        this.kanbanService.updateCard(this.projectId, this.boardId, group.id, task.id, task).subscribe(ok => {
          this.updateData();
        }, error => {
        })
      } else {
        this.updateData();
      }
    });
  }

  showMembers() {
    this.groupService.getMembers(this.projectId).pipe(shareReplay(1)).subscribe(groupMembers => {
      const observable = this.board.pipe(shareReplay(1)).subscribe(board => {
        const modifyMembersDialog = this.dialog.open(ModifyMembersComponent, {
          data: {
            members: board.members,
            canEdit: board.isAdmin,
            groupMembers: groupMembers.members
          },
          maxHeight: '50%',
        });
        modifyMembersDialog.afterClosed().subscribe((value) => {
          observable.unsubscribe();
          if (value !== undefined) {
            this.kanbanService.addMembersToKanban(this.projectId, this.boardId, board.members).subscribe(() => {
              this.snackBar.open('Se modificaron con exito los miembros del grupo', 'OK', {duration: 2000});
              this.updateData();
            }, error => {
              this.snackBar.open('No se pudieron modificar los miembros del grupo', 'OK', {duration: 2000});
              this.updateData();
            });
          }
        });
      });
    });
  }

  getAllCards():Observable<number> {
    return this.groups.pipe(map<KanbanGroup[], number>(gs => {
      let count = 0;
      gs.forEach(g => count += g.cards.length);
      return count;
    }));
  }
}
