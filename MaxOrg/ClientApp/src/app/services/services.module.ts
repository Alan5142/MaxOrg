import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {KanbanCardsService} from './kanban-cards.service';

@NgModule({
  providers: [
    KanbanCardsService
  ],
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ServicesModule {
}
