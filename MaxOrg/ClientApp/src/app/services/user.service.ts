import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {LoginResponse, RegisterResponse, User} from './user.service';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {JwtHelperService} from "@auth0/angular-jwt";

export interface User {
  key: string;
  username: string;
  realName: string;
  password?: string;
  email: string;
  description?: string;
  occupation?: string;
  birthday?: Date;
}

export interface RegisterResponse {
  username: string;
  email: string;
  resourceLocation: string;
}

export interface LoginInformation {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string | undefined;
  userResourceLocation: string | undefined;
  token: string | undefined;
  userId: string | undefined;
  refreshToken: string | undefined;
}

export interface GitHubLogin {
  valid: boolean;
  firstLogin: boolean;
}

export enum NotificationPriority {
  low,
  medium,
  high
}

export enum NotificationPreference {
  allowEverything = 1,
  allowMediumAndHigh = 2,
  allowHigh = 3
}

export interface Notification {
  id: string;
  message: string;
  context: string;
  triggerDate: string;
  priority: NotificationPriority;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userLoggedIn: User;
  http: HttpClient;

  constructor(http: HttpClient, private router: Router) {
    this.userLoggedIn = null;
    this.http = http;
  }

  getCurrentUser(): Observable<User> {
    return new Observable<User | null>(observer => {
      const token = localStorage.getItem('token');
      if (this.userLoggedIn === null && token === null) {
        observer.next(null);
        observer.complete();
      } else if (this.userLoggedIn === null && token !== null) {
        const userId = localStorage.getItem('userId');
        this.getUser(userId).subscribe(user => {
          this.userLoggedIn = user;
          observer.next(user);
          observer.complete();
        });
      } else {
        observer.next(this.userLoggedIn);
        observer.complete();
      }
    });
  }

  isUserLoggedIn(): Observable<boolean> | boolean {
    const token = localStorage.getItem('token');
    const jwtHelper = new JwtHelperService();

    if (token === null || token === 'null' || jwtHelper.isTokenExpired(token)) {
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken === null || refreshToken === 'null') {
        return false;
      }
      return this.getNewTokenWithRefresh()
        .pipe(
          map<string, boolean>(newToken =>{
            if (newToken) {
              localStorage.setItem('token', newToken);
              return true;
            }
            return false;
          })
        );
    }
    else {
      return true;
    }
  }

  getUserToken(): string {
    return localStorage.getItem('token');
  }

  get userPreferences(): Observable<NotificationPreference> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
    return this.http.get<NotificationPreference>(`${environment.apiUrl}users/notifications/preferences`, {headers: headers})
      .pipe(map<any, NotificationPreference>(response => response.preferences));
  }

  private getNewTokenWithRefresh(): Observable<string> {
    return this.http.post(`${environment.apiUrl}login/refresh-token`,
      {refreshToken: localStorage.getItem('refresh')})
      .pipe(map<any, string>(response => response.token));
  }

  getUsersByName(username: string, maxElements: number = -1): Observable<User[]> {
    return this.http.get<User[]>(environment.apiUrl + 'users?name=' + username + '&maxElements=' + maxElements);
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(environment.apiUrl + 'users/' + userId);
  }

  register(userData: User): Observable<RegisterResponse> {
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.post<RegisterResponse>(environment.apiUrl + 'users', userData, {headers: headers});
  }

  async existsUser(username: string): Promise<boolean> {
    const response = await this.http.get<User[]>(environment.apiUrl + 'users?name=' + username).toPromise();
    return response.length !== 0;
  }

  async existsEmail(email: string): Promise<boolean> {
    const response = await this.http.get<User[]>(environment.apiUrl + 'users?email=' + email).toPromise();
    return response.length !== 0;
  }

  login(data: LoginInformation): Observable<boolean> {
    return this.http.post<LoginResponse>(environment.apiUrl + 'login', data).pipe(map<LoginResponse, boolean>(value => {
      if (value.token !== undefined) {
        this.getUser(value.userId).subscribe(user => {
          this.userLoggedIn = user;
        });
        localStorage.setItem('token', value.token);
        localStorage.setItem('refresh', value.refreshToken);
        localStorage.setItem('userId', value.userId);
        return true;
      } else {
        return false;
      }
    }));
  }

  githubLogin(accessToken: string): Observable<GitHubLogin> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    return this.http.post(environment.apiUrl + 'login/github',
      {accessToken: accessToken},
      {headers: headers, observe: 'response'}).pipe(map<HttpResponse<LoginResponse>, GitHubLogin>(response => {
      if (response.body.token !== undefined) {
        console.log(response);
        localStorage.setItem('token', response.body.token);
        localStorage.setItem('refresh', response.body.refreshToken);
        localStorage.setItem('userId', response.body.userId);
        return {
          valid: true,
          firstLogin: response.headers.get('HasPassword') === null
        };
      } else {
        return {
          valid: false,
          firstLogin: false
        };
      }
    }));
  }

  closeSession(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  public getUserNotifications(): Observable<Notification[]> {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));

    return this.http.get<Notification[]>(`${environment.apiUrl}users/notifications`, {headers: headers});
  }

  public markNotificationAsRead(notification: Notification) {
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Authorization',  `Bearer ${localStorage.getItem('token')}`);

    return this.http.put<HttpResponse<any>>(`${environment.apiUrl}users/notifications/${notification.id}/mark-as-read`,
      null, {headers: headers, observe: 'response'}).pipe(map<HttpResponse<any>, boolean>(result => result.ok));
  }
}
