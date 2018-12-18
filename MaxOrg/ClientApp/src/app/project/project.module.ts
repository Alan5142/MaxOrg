import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectComponent} from './project.component';
import {
  MatButtonModule,
  MatDividerModule,
  MatExpansionModule,
  MatIconModule,
  MatMenuModule,
  MatSidenavModule,
  MatToolbarModule
} from '@angular/material';
import {ProjectRoutingModule} from './project-routing.module';
import {DescriptionComponent} from './description/description.component';
import { NavbarComponent } from './navbar/navbar.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { OrgChartComponent } from './org-chart/org-chart.component';
import { TreeComponent } from './org-chart/tree/tree.component';

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
    FlexLayoutModule
  ],
  declarations: [
    ProjectComponent,
    DescriptionComponent,
    NavbarComponent,
    OrgChartComponent,
    TreeComponent
  ],
  bootstrap: [
    ProjectComponent
  ]
})
export class ProjectModule {
}
