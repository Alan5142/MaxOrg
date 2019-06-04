import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Notification as UserNotification, UserService} from '../../services/user.service';
import {environment} from '../../../environments/environment';
import {Observable} from "rxjs";
import {AuthService, GoogleLoginProvider} from "angularx-social-login";
import {RequestPasswordChangeComponent} from "./request-password-change/request-password-change.component";

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
              private snackBar: MatSnackBar,
              public authService: AuthService) {
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
    private authService: AuthService,
    private dialog: MatDialog) {
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
    this.authService.signOut(true).then(() => {}).catch(() => {
    });
    console.log(GoogleLoginProvider.PROVIDER_ID);
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(ok => {
      this.userService.googleLogin(ok.id).subscribe(userData => {
          localStorage.setItem('token', userData.token);
          localStorage.setItem('refreshToken', userData.refreshToken);
          localStorage.setItem('userId', userData.refreshToken);
          this.router.navigate(['/start/index']);
          this.dialogRef.close();
        },
        error => {
          this.router.navigate(['/start/google-login'], {
            queryParams: {
              email: ok.email,
              photoUrl: ok.photoUrl,
              googleId: ok.id
            }
          });
          this.dialogRef.close();
        });
    }).catch(error => {
      console.log(error);
    });
  }

  isNotChromeMobile() {
    return !/^(?=.*\bChrome\b)(?=.*\bAndroid\b).*$/i.test(navigator.userAgent);
  }

  requestNewPassword() {
    this.dialog.open(RequestPasswordChangeComponent).afterClosed().subscribe(() => {
      this.dialogRef.close();
    })
  }
}

