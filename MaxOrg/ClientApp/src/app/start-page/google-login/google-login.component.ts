import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-google-login',
  templateUrl: './google-login.component.html',
  styleUrls: ['./google-login.component.scss']
})
export class GoogleLoginComponent implements OnInit {

  requiredInformation: FormGroup;
  profilePicture: string;
  userId: string;

  controlValuesEqual(otherControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return otherControl.value !== control.value ? {'controlValueEquals': {value: true}} : null;
    };
  }

  usernameExists(userService: UserService): AsyncValidatorFn {
    console.log('username exists');
    return async (control: AbstractControl): Promise<ValidationErrors> => {
      console.log('Value: ' + control.value);
      console.log(await userService.existsUser(control.value));
      return await userService.existsUser(control.value) ? {'usernameexists': {value: true}} : null;
    };
  }

  emailExists(userService: UserService): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors> => {
      return await userService.existsEmail(control.value) ? {'emailexists': {value: true}} : null;
    };
  }

  constructor(private activatedRoute: ActivatedRoute,
              private userService: UserService,
              private router: Router,
              private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.requiredInformation = this._formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeat_password: ['', [Validators.required]],
      description: ['']
    });

    this.requiredInformation.get('repeat_password').setValidators(this.controlValuesEqual(this.requiredInformation.get('password')));
    this.requiredInformation.get('username').setAsyncValidators(this.usernameExists(this.userService));
    this.requiredInformation.get('email').setAsyncValidators(this.emailExists(this.userService));

    this.activatedRoute.queryParamMap.subscribe(params => {
      const email = params.get('email');
      this.requiredInformation.get('email').setValue(email);
      this.requiredInformation.get('username').setValue(email.substr(0, email.indexOf("@")));

      this.userId = params.get('googleId');
      this.profilePicture = params.get('photoUrl');
    });
  }

  triggerPasswordValidation() {
    const password = this.requiredInformation.get('password');
    const repeatPassword = this.requiredInformation.get('repeat_password');
    if (repeatPassword.value !== password.value) {
      repeatPassword.setErrors({'controlValueEquals': {value: true}});
    } else {
      repeatPassword.setErrors(null);
    }
  }

  createAccount() {
    if (!this.requiredInformation.valid) {
      return;
    }

    const request = {
      username: this.requiredInformation.get('username').value,
      password: this.requiredInformation.get('password').value,
      email: this.requiredInformation.get('email').value,
      description: this.requiredInformation.get('description').value,
      profileUrl: this.profilePicture,
      userId: this.userId
    };

    console.log(request);

    this.userService.googleRegister(request).subscribe(result => {
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('userId', result.refreshToken);
      this.router.navigate(['/']);
    });
  }
}
