import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../user.service';
import {NotificationService} from "../notification.service";

@Injectable({
  providedIn: 'root'
})
export class IsLoggedInGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router, private notification: NotificationService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isLoggedIn = this.userService.isUserLoggedIn();
    if (typeof isLoggedIn === "boolean") {
      if (!isLoggedIn) {
        this.router.navigate(['/start']);
      }
      if (!this.notification.connected) {
        this.notification.connect();
      }
      return true;
    } else {
      isLoggedIn.subscribe(isLoggedIn => {
        if (isLoggedIn && !this.notification.connected) {
          this.notification.connect();
        }
      });
      return isLoggedIn;
    }
  }
}
