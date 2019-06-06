import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.scss']
})
export class ForgottenPasswordComponent implements OnInit {
  form: FormGroup;
  payload: string;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              routeSnapshot: ActivatedRoute,
              private snackbar: MatSnackBar,
              private router: Router) {
    routeSnapshot.queryParamMap.subscribe(params => {
      this.payload = params.get('payload');
    });
    this.form = this.fb.group({
      password: ['', [Validators.minLength(8), Validators.required]],
      repeatPassword: ['', [Validators.minLength(8), Validators.required]]
    });
  }

  ngOnInit() {
    this.form.get('password').setValidators(this.matchValidator('repeatPassword'));
  }

  changePassword() {
    this.userService.changePassword(this.form.get('password').value, this.payload).subscribe(() => {
      this.snackbar.open('Actualizada con exito, inicia sesión', 'OK', {duration: 2000});
      this.router.navigate(['/']);
    }, err => {
      this.snackbar.open('No se pudieron actualizar los datos', 'OK', {duration: 2000});
    });
  }

  matchValidator(otherComponent: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const repeatPasswordControl = control.root.get(otherComponent);
      return control.value !== repeatPasswordControl.value ? {'mismatch': {value: true}} : null;
    };
  }
}
