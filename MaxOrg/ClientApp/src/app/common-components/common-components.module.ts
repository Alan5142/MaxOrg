import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContextMenuComponent} from './context-menu/context-menu.component';
import { NotificationsComponent } from './notifications/notifications.component';
import {MatBadgeModule, MatDividerModule, MatListModule, MatRippleModule} from "@angular/material";
import {ServicesModule} from "../services/services.module";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
  declarations: [ContextMenuComponent, NotificationsComponent],
  imports: [
    CommonModule,
    MatDividerModule,
    ServicesModule,
    MatRippleModule,
    MatListModule,
    FlexLayoutModule,
    MatBadgeModule
  ],
  exports: [
    ContextMenuComponent,
    NotificationsComponent,
  ]
})
export class CommonComponentsModule {
}
