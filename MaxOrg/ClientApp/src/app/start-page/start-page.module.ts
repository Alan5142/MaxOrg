import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatListModule, MatMenuModule,
  MatToolbarModule
} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule} from '@angular/forms';
import {NavbarComponent, NavbarDialogComponent} from './navbar/navbar.component';
import {StartPageRoutingModule} from './start-page-routing.module';
import { IndexComponent } from './index/index.component';
import {StartPageComponent} from './start-page.component';
import { UserStartComponent } from './user-start/user-start.component';
import {AuthService} from './auth.service';
import { MyAccountComponent } from './my-account/my-account.component';

@NgModule({
  providers: [
    AuthService
  ],
  entryComponents: [
    NavbarComponent,
    NavbarDialogComponent,
    StartPageComponent
  ],
  declarations: [
    NavbarComponent,
    NavbarDialogComponent,
    IndexComponent,
    StartPageComponent,
    UserStartComponent,
    MyAccountComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    FlexLayoutModule,
    FormsModule,
    MatBadgeModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    StartPageRoutingModule
  ],
  bootstrap: [StartPageComponent]
})
export class StartPageModule { }
