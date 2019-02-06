import {InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {Routes, RouterModule, ActivatedRouteSnapshot} from '@angular/router';
import {ProjectComponent} from './project.component';
import {DescriptionComponent} from './description/description.component';
import {KanbanBoardComponent} from './kanban-board/kanban-board.component';
import {MessagesComponent} from './messages/messages.component';
import {AssignedWorkComponent} from './assigned-work/assigned-work.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {BoardComponent} from './kanban-board/board/board.component';
import {KanbanIndexComponent} from './kanban-board/kanban-index/kanban-index.component';
import {CodeComponent} from './code/code.component';
import { OrgChartComponent } from './org-chart/org-chart.component';
import {RequirementsComponent} from './requirements/requirements.component';
import {MembersComponent} from './members/members.component';

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
      {path: 'dashboard', component: AdminDashboardComponent},
      {path: 'code', component: CodeComponent},
      {path: 'org-chart', component: OrgChartComponent},
      {path: 'requirements', component: RequirementsComponent},
      {path: 'members', component: MembersComponent}
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {
}
