import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectComponent} from './project.component';
import {
  MatButtonModule, MatCardModule,
  MatDividerModule,
  MatExpansionModule, MatFormFieldModule,
  MatIconModule, MatInputModule, MatListModule,
  MatMenuModule, MatRippleModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import {ProjectRoutingModule} from './project-routing.module';
import {DescriptionComponent} from './description/description.component';
import { NavbarComponent } from './navbar/navbar.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { GroupComponent } from './kanban-board/group/group.component';
import { CardComponent } from './kanban-board/group/card/card.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ServicesModule} from '../services/services.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import { ChatComponent } from './messages/chat/chat.component';

@NgModule({
  entryComponents: [
    ProjectComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatSidenavModule,
    ProjectRoutingModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    DragDropModule,
    ServicesModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatRippleModule,
    MatInputModule
  ],
  declarations: [
    ProjectComponent,
    DescriptionComponent,
    NavbarComponent,
    KanbanBoardComponent,
    GroupComponent,
    CardComponent,
    MessagesComponent,
    ChatComponent
  ],
  bootstrap: [
    ProjectComponent
  ]
})
export class ProjectModule {
}
