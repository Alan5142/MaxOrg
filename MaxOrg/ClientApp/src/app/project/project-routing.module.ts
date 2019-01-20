import {ModuleWithProviders, NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProjectComponent} from './project.component';
import {DescriptionComponent} from './description/description.component';
import {KanbanBoardComponent} from './kanban-board/kanban-board.component';
import {MessagesComponent} from './messages/messages.component';
import {AssignedWorkComponent} from './assigned-work/assigned-work.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {BoardComponent} from './kanban-board/board/board.component';
import {KanbanIndexComponent} from './kanban-board/kanban-index/kanban-index.component';

const routes: Routes = [
  {
    path: '', component: ProjectComponent, children: [
      {path: '', component: DescriptionComponent},
      {
        path: 'board', component: KanbanBoardComponent, children: [
          {path: '', component: KanbanIndexComponent},
          {path: ':boardId', component: BoardComponent}
        ]
      },
      {path: 'messages', component: MessagesComponent},
      {path: 'assignedWork', component: AssignedWorkComponent},
      {path: 'dashboard', component: AdminDashboardComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {
}
