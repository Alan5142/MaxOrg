import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {HttpClient} from '@angular/common/http';


export interface DialogData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  constructor(private dialog: MatDialog) {
  }

  username: string;
  password: string;

  ngOnInit() {
  }

  cargarInicioSesion() {
    const dialogRef = this.dialog.open(NavbarDialogComponent, {
      minWidth: '300px',
      data: {username: this.username, password: this.password}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
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
    private http: HttpClient) {
  }

  login(): void {
    console.log(this.data);

    this.http.post('https://localhost:44384/api/login', {username: this.data.username, password: this.data.password})
      .toPromise().then(object => {
      alert(object);
    }).catch(o => console.log(o));

    this.dialogRef.close();
  }

}
