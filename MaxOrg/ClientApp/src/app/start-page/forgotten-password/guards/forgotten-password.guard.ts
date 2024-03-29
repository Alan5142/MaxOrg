import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from "../../../services/user.service";

@Injectable({
  providedIn: 'root'
})
export class ForgottenPasswordGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!next.queryParamMap.has('payload')) {
      return false;
    }
    return this.userService.isForgottenPasswordPayloadValid(next.queryParamMap.get('payload'), () => {
      this.router.navigate(['/']);
    });
  }

}
