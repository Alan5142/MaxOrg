import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {IsLoggedInGuard} from './services/guards/is-logged-in.guard';

const routes: Routes = [
  {path: '', redirectTo: 'start', pathMatch: 'full'},
  {path: 'start', loadChildren: './start-page/start-page.module#StartPageModule'},
  {path: 'project/:id', loadChildren: './project/project.module#ProjectModule', canActivate: [IsLoggedInGuard]},
  {path: '**', redirectTo: 'start/not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
