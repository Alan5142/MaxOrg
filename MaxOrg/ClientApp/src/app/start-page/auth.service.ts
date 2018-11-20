import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {
  }

  public authUser(username: string, password: string): boolean {
    localStorage.setItem('token', 'token-example');
    return true;
  }

  public isUserAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null;
  }
}
