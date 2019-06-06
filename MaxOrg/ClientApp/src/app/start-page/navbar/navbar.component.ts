import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {Notification as UserNotification, UserService} from '../../services/user.service';
import {environment} from '../../../environments/environment';
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
  constructor(private dialog: MatDialog,
              public userService: UserService,
              private router: Router,
              private snackBar: MatSnackBar,
              public authService: AuthService) {
  }

  ngOnInit() {
  }

  displayLoginDialog(): void {
    const dialogRef = this.dialog.open(NavbarDialogComponent, {
      minWidth: '330px'
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
  username: string;
  password: string;

  constructor(
    public dialogRef: MatDialogRef<NavbarDialogComponent>,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog) {
  }

  login(): void {
    this.userService.login({username: this.username, password: this.password}).subscribe(() => {
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
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${environment.githubAuth.clientId}&scope=repo`;
  }

  googleLogin() {
    this.authService.signOut(true).catch(() => { });
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

