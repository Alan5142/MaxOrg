import {InjectionToken, NgModule} from '@angular/core';
import {Routes, RouterModule, PreloadAllModules, ActivatedRouteSnapshot} from '@angular/router';
import {IsLoggedInGuard} from './services/guards/is-logged-in.guard';
import {AppComponent} from './app.component';

const routes: Routes = [
  {path: '', redirectTo: 'start', pathMatch: 'full'},
  {path: 'start', loadChildren: './start-page/start-page.module#StartPageModule'},
  {path: 'project/:id', loadChildren: './project/project.module#ProjectModule', canActivate: [IsLoggedInGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
