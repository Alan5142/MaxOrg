import {Component, Input, OnInit} from '@angular/core';
import {KanbanCard} from '../../../../services/kanban-cards.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() kanbanCard: KanbanCard;

  constructor() {
  }

  ngOnInit() {
  }

  cardClicked() {
  }
}
