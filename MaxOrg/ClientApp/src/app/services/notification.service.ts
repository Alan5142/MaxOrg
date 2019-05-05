import {Injectable} from '@angular/core';
import * as signalR from '@aspnet/signalr';
import {HubConnectionState} from '@aspnet/signalr';
import {Observable, Subject} from "rxjs";
import {UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  connection: signalR.HubConnection;
  private _subject = new Subject<void>();
  notificationsUpdate$: Observable<void> = this._subject.asObservable();
  private _startedConnection = false;

  constructor(userService: UserService) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/notification-hub', {accessTokenFactory: () => userService.userToken})
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.connection.onclose(() => this._startedConnection = false);
  }

  public connect() {
    if (this.connection.state !== HubConnectionState.Disconnected || this._startedConnection) return;
    this._startedConnection = true;
    this.connection.start()
      .then(ok => this.connection.send('connectToHub'));

    this.connection.on('notificationReceived', (message: string) => {
      try {
        const notification = new Notification(message, {icon: '/favicon.ico', requireInteraction: false, silent: true});
        this._subject.next();
      } catch (exception) {
        navigator.serviceWorker.getRegistration().then(reg => {
          console.log(reg);
          reg.showNotification('MaxOrg', {
            body: message,
            icon: '/favicon.ico',
            vibrate: [200, 100, 200, 100, 200, 100, 200]
          }).then(res => {}, err => {});
        });
      }
    });
  }

  public get connected(): boolean {
    return this.connection.state === HubConnectionState.Connected;
  }

}
