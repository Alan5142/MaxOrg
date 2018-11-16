import {ModuleWithProviders, NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {NavbarComponent} from './navbar/navbar.component';
import {IndexComponent} from './index/index.component';
import {StartPageComponent} from './start-page.component';
import {UserStartComponent} from './user-start/user-start.component';

const routes: Routes = [
  {
    path: '', component: StartPageComponent, children: [
      {path: '', component: IndexComponent},
      {path: 'index', component: UserStartComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartPageRoutingModule {
}
