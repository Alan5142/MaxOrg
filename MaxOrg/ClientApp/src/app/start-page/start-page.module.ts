import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule, MatListModule,
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

@NgModule({
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
    UserStartComponent
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
    MatCardModule,
    MatIconModule,
    MatListModule,
    StartPageRoutingModule
  ],
  bootstrap: [StartPageComponent]
})
export class StartPageModule { }
