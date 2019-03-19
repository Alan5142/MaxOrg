import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {environment} from '../../../environments/environment';
import {Observable} from "rxjs";
import {Notification as UserNotification} from '../../services/user.service';

export interface DialogData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-start-page-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  notifications: Observable<UserNotification[]>;
  username: string;
  password: string;

  constructor(private dialog: MatDialog,
              public userService: UserService,
              private router: Router,
              private snackBar: MatSnackBar) {
    this.notifications = userService.getUserNotifications();
  }

  ngOnInit() {
  }

  displayLoginDialog(): void {
    const dialogRef = this.dialog.open(NavbarDialogComponent, {
      minWidth: '330px',
      data: {username: this.username, password: this.password}
    });
  }

  navigateToContext(notification: UserNotification) {
    if (!notification.context) {
      this.snackBar.open('Error al intentar navegar a la notificación', 'OK', {duration: 1500});
      return;
    }
    this.userService.markNotificationAsRead(notification).subscribe();
    this.router.navigate([notification.context])
      .catch(() => this.snackBar.open('Error al intentar navegar a la notificación', 'OK', {duration: 1500}));
  }
}

@Component({
  selector: 'app-navbar-dialog',
  templateUrl: 'navbar.dialog.html',
})
export class NavbarDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<NavbarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private router: Router,
    private userService: UserService) {
  }

  login(): void {
    this.userService.login({username: this.data.username, password: this.data.password}).subscribe(loginSucceed => {
      this.router.navigate(['/start/index']);
      this.dialogRef.close();
    }, error => {
      alert('No se pudo iniciar sesión');
    });
  }

  goToRegister(): void {
    this.router.navigate(['/start/register']);
    this.dialogRef.close();
  }

  githubLogin(): void {
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=' + environment.githubAuth.clientId;
  }
}
