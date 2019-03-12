import {Injectable} from '@angular/core';
import * as signalR from '@aspnet/signalr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  connection: signalR.HubConnection;

  constructor() {
  }

  public connect() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/notification-hub', {accessTokenFactory: () => localStorage.getItem('token')})
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.connection.start()
      .then(ok => this.connection.send('connectToHub'));

    this.connection.on('notificationReceived', (message: string) => {
      const notification = new Notification(message, {icon: '/favicon.ico', requireInteraction: false, silent: true});
      console.log('Se recibio notificación :D');
    });
  }

}
