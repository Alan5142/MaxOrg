import {Injectable} from '@angular/core';
import * as signalR from '@aspnet/signalr';

export enum NotificationReceiverType {
  user,
  group
}

export interface NotificationRequest {
  message: string;
  receiverType: NotificationReceiverType;
  usersOrGroups: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  connection: signalR.HubConnection;

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

  constructor() {
    console.log(':D');
  }
}
