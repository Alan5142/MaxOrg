import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatOptionModule,
  MatRadioModule,
  MatSelectModule,
  MatToolbarModule,
  MatSidenavModule,
  MatStepperModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatAutocompleteModule
} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NavbarComponent, NavbarDialogComponent} from './navbar/navbar.component';
import {StartPageRoutingModule} from './start-page-routing.module';
import {IndexComponent} from './index/index.component';
import {StartPageComponent} from './start-page.component';
import {UserStartComponent} from './user-start/user-start.component';
import {MyAccountComponent, MyAccountPickImageComponent} from './my-account/my-account.component';
import {NewProjectComponent} from './new-project/new-project.component';
import {TodosComponent} from './todos/todos.component';
import { RegisterComponent } from './register/register.component';
import {ServicesModule} from "../services/services.module";
import { GithubLoginComponent } from './github-login/github-login.component';

@NgModule({
  providers: [
  ],
  entryComponents: [
    NavbarComponent,
    NavbarDialogComponent,
    StartPageComponent,
    MyAccountPickImageComponent,
    NewProjectComponent
  ],
  declarations: [
    NavbarComponent,
    NavbarDialogComponent,
    IndexComponent,
    StartPageComponent,
    UserStartComponent,
    MyAccountComponent,
    MyAccountPickImageComponent,
    NewProjectComponent,
    TodosComponent,
    RegisterComponent,
    GithubLoginComponent
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
    MatBottomSheetModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatOptionModule,
    MatSelectModule,
    MatRadioModule,
    StartPageRoutingModule,
    MatExpansionModule,
    MatChipsModule,
    MatSidenavModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    ServicesModule
  ],
  bootstrap: [StartPageComponent]
})
export class StartPageModule {
}
