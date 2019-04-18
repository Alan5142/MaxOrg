import {Injectable} from '@angular/core';
import * as signalR from '@aspnet/signalr';
import {Observable, Subscriber} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  connection: signalR.HubConnection;
  notificationsUpdate$: Observable<void>;
  private subscriber: Subscriber<void>;

  constructor() {
    this.notificationsUpdate$ = new Observable<void>(logic => {
      this.subscriber = logic;
    });
  }

  public connect() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/notification-hub', {accessTokenFactory: () => localStorage.getItem('token')})
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.connection.start()
      .then(ok => this.connection.send('connectToHub'));

    this.connection.on('notificationReceived', (message: string) => {
      try {
        const notification = new Notification(message, {icon: '/favicon.ico', requireInteraction: false, silent: true});
        this.subscriber.next();
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

}
