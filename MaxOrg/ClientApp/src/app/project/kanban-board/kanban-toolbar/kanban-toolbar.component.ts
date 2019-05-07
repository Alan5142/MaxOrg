import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';

@Component({
  selector: 'app-kanban-toolbar',
  templateUrl: './kanban-toolbar.component.html',
  styleUrls: ['./kanban-toolbar.component.scss']
})
export class KanbanToolbarComponent implements OnInit {

  @Output() reload = new EventEmitter<any>();
  @Output() createSection = new EventEmitter<any>();
  @Output() members = new EventEmitter<any>();

  @Input() canEdit = false;

  constructor(public mediaObserver: MediaObserver) {
  }

  ngOnInit() {
  }

}
