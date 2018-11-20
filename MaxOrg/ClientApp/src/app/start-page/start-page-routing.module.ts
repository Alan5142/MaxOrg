import {ModuleWithProviders, NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NavbarComponent} from './navbar/navbar.component';
import {IndexComponent} from './index/index.component';
import {StartPageComponent} from './start-page.component';
import {UserStartComponent} from './user-start/user-start.component';
import {AuthService} from './auth.service';
import {AuthGuard} from './auth.guard';
import {MyAccountComponent} from './my-account/my-account.component';

const routes: Routes = [
  {
    path: '', component: StartPageComponent, children: [
      {path: '', component: IndexComponent, canActivate: [AuthGuard]},
      {path: 'index', component: UserStartComponent},
      {path: 'my_account', component: MyAccountComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartPageRoutingModule {
}
