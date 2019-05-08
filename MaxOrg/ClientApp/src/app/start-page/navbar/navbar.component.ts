import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Notification as UserNotification, UserService} from '../../services/user.service';
import {environment} from '../../../environments/environment';
import {Observable} from "rxjs";
import {AuthService, GoogleLoginProvider} from "angularx-social-login";

export interface DialogData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-start-page-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
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

declare const gapi;

@Component({
  selector: 'app-navbar-dialog',
  templateUrl: 'navbar.dialog.html'
})
export class NavbarDialogComponent {
  private clientId: string = '495753764174-kr5o676hqpcqlpb40a7m2a92v7614hst.apps.googleusercontent.com';

  constructor(
    public dialogRef: MatDialogRef<NavbarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private authService: AuthService) {
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

  googleLogin() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.authService.authState.subscribe(c => {console.log(c)}, err => {});
  }
}

