import {Component, OnInit, Output} from '@angular/core';
import {merge, Observable} from "rxjs";
import {Notification as UserNotification, UserService} from "../../services/user.service";
import {MatSnackBar} from "@angular/material";
import {Router} from "@angular/router";
import {map, share, shareReplay} from "rxjs/operators";
import {NotificationService} from "../../services/notification.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  notifications: Observable<UserNotification[]> = null;

  constructor(public userService: UserService,
              private snackBar: MatSnackBar,
              private router: Router,
              private notificationService: NotificationService) {
    this.notifications = this.userService.getUserNotifications().pipe(shareReplay(1));
    this.notifications.subscribe(_ => {}, _ => this.notifications = null);
    notificationService.notificationsUpdate$.subscribe(_ => {
      this.fetchNotifications();
    });
  }

  ngOnInit() {
  }

  private fetchNotifications() {
    const newNotifications = this.userService.getUserNotifications().pipe(shareReplay(1));
    this.notifications = merge(this.notifications, newNotifications);
  }

  navigateToContext(notification: UserNotification) {
    if (!notification.context) {
      this.snackBar.open('Error al intentar navegar a la notificación', 'OK', {duration: 1500});
      return;
    }
    this.userService.markNotificationAsRead(notification).subscribe(_ => {
      this.router.navigate([notification.context])
        .then(_ => this.fetchNotifications())
        .catch(_ => this.snackBar.open('Error al intentar navegar a la notificación', 'OK', {duration: 1500}));
    });
  }

  public getNumberOfUnreadNotifications(): Observable<number> {
    return this.notifications.pipe(map<UserNotification[], number>(res => {
      let length = res.filter(notification => !notification.read).length;
      length = length === 0 ? null : length;
      return length;
    }), share());
  }

}
