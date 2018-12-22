import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';


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
  notifications: number[];
  constructor(private dialog: MatDialog, public userService: UserService) {
    this.notifications = Array(10).fill(4);
  }

  username: string;
  password: string;

  ngOnInit() {
  }

  displayLoginDialog(): void {
    const dialogRef = this.dialog.open(NavbarDialogComponent, {
      minWidth: '330px',
      data: {username: this.username, password: this.password}
    });
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

}
