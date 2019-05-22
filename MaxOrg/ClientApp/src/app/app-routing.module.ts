import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {IsLoggedInGuard} from './services/guards/is-logged-in.guard';
import {DevopsAuthComponent} from "./devops-auth/devops-auth.component";

const routes: Routes = [
  {path: '', redirectTo: 'start', pathMatch: 'full'},
  {path: 'start', loadChildren: './start-page/start-page.module#StartPageModule'},
  {path: 'auth/devops', component: DevopsAuthComponent, canActivate: [IsLoggedInGuard]},
  {path: 'project/:id', loadChildren: './project/project.module#ProjectModule', canActivate: [IsLoggedInGuard]},
  {path: '**', redirectTo: 'start/not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
