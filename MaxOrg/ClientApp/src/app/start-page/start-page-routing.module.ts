import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IndexComponent} from './index/index.component';
import {StartPageComponent} from './start-page.component';
import {UserStartComponent} from './user-start/user-start.component';
import {MyAccountComponent} from './my-account/my-account.component';
import {TodosComponent} from './todos/todos.component';
import {RegisterComponent} from './register/register.component';
import {IsLoggedInGuard} from '../services/guards/is-logged-in.guard';
import {IsNotLoggedInGuard} from '../services/guards/is-not-logged-in.guard';
import {GithubLoginComponent} from './github-login/github-login.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {GoogleLoginComponent} from "./google-login/google-login.component";

const routes: Routes = [
  {
    path: '', component: StartPageComponent, children: [
      {path: '', component: IndexComponent, canActivate: [IsNotLoggedInGuard]},
      {path: 'register', component: RegisterComponent, canActivate: [IsNotLoggedInGuard]},
      {path: 'google-login', component: GoogleLoginComponent, canActivate: [IsNotLoggedInGuard]},
      {path: 'github-login', component: GithubLoginComponent},
      {path: 'index', component: UserStartComponent, canActivate: [IsLoggedInGuard]},
      {path: 'my_account', component: MyAccountComponent, canActivate: [IsLoggedInGuard]},
      {path: 'todos', component: TodosComponent, canActivate: [IsLoggedInGuard]},
      {path: 'not-found', component: NotFoundComponent},
      {path: '**', redirectTo: 'not-found'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartPageRoutingModule {
}
