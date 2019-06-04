import {Component, OnInit} from '@angular/core';
import {UserService} from "../../../services/user.service";
import {MatDialogRef, MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-request-password-change',
  templateUrl: './request-password-change.component.html',
  styleUrls: ['./request-password-change.component.scss']
})
export class RequestPasswordChangeComponent implements OnInit {

  constructor(private userService: UserService,
              private dialogRef: MatDialogRef<RequestPasswordChangeComponent>,
              private snackbar: MatSnackBar) { }

  ngOnInit() {
  }

  requestNewPassword(username: string, email: string) {
    username = username.trim() === '' ? null : username;
    email = email.trim() === '' ? null : email;
    const message = () => {
      this.snackbar.open('Se enviarán las instrucciones para cambiar tu contraseña a tu correo en caso de que los datos' +
        ' que insertaste sean validos, ten paciencia', 'Ok', {duration: 5000});
      this.dialogRef.close();
    };
    this.userService.forgottenPassword(email, username).subscribe(r => {
      message();
    }, err => {
      message();
    });
  }
}
