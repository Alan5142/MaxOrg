import {ModuleWithProviders, NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ProjectComponent} from './project.component';
import {DescriptionComponent} from './description/description.component';
import { OrgChartComponent } from './org-chart/org-chart.component';

const routes: Routes = [
  {
    path: '', component: ProjectComponent, children: [
      {path: '', component: DescriptionComponent},
      {path: 'org-chart', component:OrgChartComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule {
}
