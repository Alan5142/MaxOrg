import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContextMenuComponent} from './context-menu/context-menu.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatDividerModule,
  MatListModule,
  MatRippleModule,
  MatTooltipModule
} from "@angular/material";
import {ServicesModule} from "../services/services.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {SpeedDialFabComponent} from "./speed-dial-fab/speed-dial-fab.component";
import {ClickOutsideDirective} from "./shared/click-outside.directive";
import {DomChangeDirective} from "./shared/dom-change.directive";
import {InViewportDirective} from "./shared/in-viewport.directive";

@NgModule({
  declarations: [
    ContextMenuComponent,
    NotificationsComponent,
    SpeedDialFabComponent,
    ClickOutsideDirective,
    DomChangeDirective,
    InViewportDirective
  ],
  imports: [
    CommonModule,
    MatDividerModule,
    ServicesModule,
    MatRippleModule,
    MatListModule,
    FlexLayoutModule,
    MatBadgeModule,
    MatTooltipModule,
    MatButtonModule
  ],
  exports: [
    ContextMenuComponent,
    NotificationsComponent,
    SpeedDialFabComponent
  ]
})
export class CommonComponentsModule {
}
