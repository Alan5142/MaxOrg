import {Injectable} from '@angular/core';
import {HubConnection} from '@aspnet/signalr';
import {UserService} from './user.service';
import {Observable} from 'rxjs';
import {HubConnectionBuilder} from '@aspnet/signalr';

interface Notification {
  message: string;
  context: string;
  triggerDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  hubConnection: HubConnection;
  private notificationObservable: Observable<Notification>;

  constructor(private userService: UserService) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/chatHub', {accessTokenFactory: () => userService.getUserToken()})
      .build();

    this.notificationObservable = new Observable<Notification>(observer => {
      this.hubConnection.on('ReceiveNotification', (message: string, context: string, triggerDate: Date) => {
        observer.next({message: message, context: context, triggerDate: triggerDate});
      });
    });
  }

  onReceiveNotification(): Observable<Notification> {
    return this.notificationObservable;
  }
}
