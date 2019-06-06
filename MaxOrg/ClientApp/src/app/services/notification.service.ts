import {Injectable} from '@angular/core';
import * as signalR from '@aspnet/signalr';
import {HubConnectionState} from '@aspnet/signalr';
import {Observable, Subject} from "rxjs";
import {Notification, NotificationPreference, NotificationPriority, UserService} from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  connection: signalR.HubConnection;
  private _subject = new Subject<void>();
  notificationsUpdate$: Observable<void> = this._subject.asObservable();
  private _startedConnection = false;

  constructor(private userService: UserService) {
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

    this.connection.on('notificationReceived', (receivedNotification: Notification) => {
      const triggerNotification = () => {
        try {
          const notification = new Notification(receivedNotification.message, {
            icon: '/favicon.ico',
            requireInteraction: false,
            silent: true,
          });
        } catch (exception) {
          navigator.serviceWorker.getRegistration().then(reg => {
            reg.showNotification('MaxOrg', {
              body: receivedNotification.message,
              icon: '/favicon.ico',
              vibrate: [200, 100, 200, 100, 200, 100, 200]
            }).then(res => {
            }, err => {
            });
          });
        }
      };

      this.userService.getCurrentUser().subscribe(user => {
        switch (user.notificationPreference) {
          case NotificationPreference.allowEverything:
            triggerNotification();
            break;
          case NotificationPreference.allowMediumAndHigh:
            if (receivedNotification.priority !== NotificationPriority.low) {
              triggerNotification();
            }
            break;
          case NotificationPreference.allowHigh:
            if (receivedNotification.priority === NotificationPriority.high) {
              triggerNotification();
            }
            break;

        }
        this._subject.next();
      });
    });
  }

  public get connected(): boolean {
    return this.connection.state === HubConnectionState.Connected;
  }

}
