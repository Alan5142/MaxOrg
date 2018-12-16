import {ModuleWithProviders, NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProjectComponent} from './project.component';
import {DescriptionComponent} from './description/description.component';
import {KanbanBoardComponent} from './kanban-board/kanban-board.component';

const routes: Routes = [
  {
    path: '', component: ProjectComponent, children: [
      {path: '', component: DescriptionComponent},
      {path: 'board', component: KanbanBoardComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {
}
