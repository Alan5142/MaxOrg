import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProjectComponent} from './project.component';
import {
  GestureConfig,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTreeModule
} from '@angular/material';
import {ProjectRoutingModule} from './project-routing.module';
import {DescriptionComponent} from './description/description.component';
import {NavbarComponent} from './navbar/navbar.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {KanbanBoardComponent} from './kanban-board/kanban-board.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ServicesModule} from '../services/services.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessagesComponent} from './messages/messages.component';
import {ChatComponent} from './messages/chat/chat.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {AssignedWorkComponent} from './assigned-work/assigned-work.component';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {AssignWorkComponent} from './assigned-work/assign-work/assign-work.component';
import {CreateTaskComponent} from './assigned-work/create-task/create-task.component';
import {CreateDialogComponent} from './assigned-work/create-task/create-dialog/create-dialog.component';
import {DeleteTaskDialogComponent} from './assigned-work/create-task/delete-task-dialog/delete-task-dialog.component';
import {EditTaskComponent} from './assigned-work/create-task/edit-task/edit-task.component';
import {AdminDashboardComponent} from './admin-dashboard/admin-dashboard.component';
import {LayoutModule} from '@angular/cdk/layout';
import {Ng2GoogleChartsModule} from 'ng2-google-charts';
import {KanbanToolbarComponent} from './kanban-board/kanban-toolbar/kanban-toolbar.component';
import {BoardComponent} from './kanban-board/board/board.component';
import {KanbanIndexComponent} from './kanban-board/kanban-index/kanban-index.component';
import {ChatMessageComponent} from './messages/chat/chat-message/chat-message.component';
import {VirtualScrollerModule} from 'ngx-virtual-scroller';
import {CodeComponent} from './code/code.component';
import {CommonComponentsModule} from '../common-components/common-components.module';
import {OrgChartComponent} from './org-chart/org-chart.component';
import {TreeComponent} from './org-chart/tree/tree.component';
import {GroupCardComponent} from './org-chart/group-card/group-card.component';
import {RequirementsComponent} from './requirements/requirements.component';
import {MembersComponent} from './members/members.component';
import {ChangeDescriptionComponent} from './admin-dashboard/change-description/change-description.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {PostsComponent} from './posts/posts.component';
import {CalendarComponent} from './calendar/calendar.component';
import {CreateCardComponent} from './kanban-board/board/create-card/create-card.component';
import {TestsComponent} from './tests/tests.component';
import {RecordComponent} from './tests/record/record.component';
import {CreateTestComponent} from './tests/create-test/create-test.component';
import {CreateTestDialogComponent} from './tests/create-test/create-test-dialog/create-test-dialog.component';
import {CreateReportDialogComponent} from './tests/record/create-report-dialog/create-report-dialog.component';
import {ReportsComponent} from './tests/reports/reports.component';
import { NodeComponent } from './org-chart/tree/node/node.component';

@NgModule({
  entryComponents: [
    ProjectComponent,
    AssignWorkComponent,
    CreateDialogComponent,
    DeleteTaskDialogComponent,
    EditTaskComponent,
    GroupCardComponent,
    ChangeDescriptionComponent,
    CreateCardComponent,
    CreateReportDialogComponent,
    CreateTestDialogComponent
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
    MatInputModule,
    ScrollingModule,
    MatTabsModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatGridListModule,
    LayoutModule,
    Ng2GoogleChartsModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSelectModule,
    VirtualScrollerModule,
    MatTreeModule,
    MatIconModule,
    CommonComponentsModule
  ],
  declarations: [
    ProjectComponent,
    DescriptionComponent,
    NavbarComponent,
    KanbanBoardComponent,
    MessagesComponent,
    ChatComponent,
    AssignedWorkComponent,
    AssignWorkComponent,
    CreateTaskComponent,
    CreateDialogComponent,
    DeleteTaskDialogComponent,
    EditTaskComponent,
    AdminDashboardComponent,
    KanbanToolbarComponent,
    BoardComponent,
    KanbanIndexComponent,
    ChatMessageComponent,
    CodeComponent,
    OrgChartComponent,
    TreeComponent,
    GroupCardComponent,
    RequirementsComponent,
    MembersComponent,
    ChangeDescriptionComponent,
    NotFoundComponent,
    PostsComponent,
    CalendarComponent,
    CreateCardComponent,
    TestsComponent,
    RecordComponent,
    CreateTestComponent,
    CreateTestDialogComponent,
    CreateReportDialogComponent,
    ReportsComponent,
    NodeComponent
  ],
  bootstrap: [
    ProjectComponent
  ],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ]
})
export class ProjectModule {
}
