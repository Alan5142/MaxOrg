import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {KanbanBoard, KanbanCard, KanbanCardsService, KanbanGroup} from '../../services/kanban-cards.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {

  kanbanBoard: KanbanBoard;

  route: ActivatedRoute;

  constructor(route: ActivatedRoute, public kanbanService: KanbanCardsService) {
    this.kanbanBoard = kanbanService.getKanbanBoardById(0);
    this.route = route;
  }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<KanbanGroup[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  getOtherGroupIds(): string[] {
    const ids: string[] = [];
    this.kanbanBoard.cardGroups.forEach(value => {
      ids.push('kanban-group-' + value.id);
    });
    return ids;
  }

}
