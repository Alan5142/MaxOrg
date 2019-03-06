import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class IsNotLoggedInGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isLoggedIn = this.userService.isUserLoggedIn();
    if (isLoggedIn) {
      this.router.navigate(['start/index']);
    }
    return true;
  }
}
