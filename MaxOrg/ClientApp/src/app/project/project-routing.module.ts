import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProjectComponent} from './project.component';
import {DescriptionComponent} from './description/description.component';
import {KanbanBoardComponent} from './kanban-board/kanban-board.component';
import {MessagesComponent} from './messages/messages.component';
import {AssignedWorkComponent} from './assigned-work/assigned-work.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {BoardComponent} from './kanban-board/board/board.component';
import {KanbanIndexComponent} from './kanban-board/kanban-index/kanban-index.component';
import {CodeComponent} from './code/code.component';
import {OrgChartComponent} from './org-chart/org-chart.component';
import {RequirementsComponent} from './requirements/requirements.component';
import {MembersComponent} from './members/members.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {ProjectIndexComponent} from './project-index/project-index.component';
import { PostsSectionComponent } from './posts-section/posts-section.component';
const routes: Routes = [
  {
    path: '', component: ProjectComponent, children: [
      {path: '', component: ProjectIndexComponent},
      {
        path: 'board', component: KanbanBoardComponent, children: [
          {path: '', component: KanbanIndexComponent},
          {path: ':boardId', component: BoardComponent}
        ]
      },
      {path: 'messages', component: MessagesComponent},
      {path: 'assigned-work', component: AssignedWorkComponent},
      {path: 'dashboard', component: AdminDashboardComponent},
      {path: 'code', component: CodeComponent},
      {path: 'org-chart', component: OrgChartComponent},
      {path: 'requirements', component: RequirementsComponent},
      {path: 'members', component: MembersComponent},
      {path: 'description', component: DescriptionComponent},
      {path: 'posts', component: PostsSectionComponent},
      {path: 'not-found', component: NotFoundComponent},
      {path: '**', redirectTo: 'not-found'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {
}
