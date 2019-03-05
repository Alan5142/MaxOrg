import {Component, OnInit} from '@angular/core';
import {User, UserService} from '../../services/user.service';
import {AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {MediaObserver} from '@angular/flex-layout';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  requiredInformation: FormGroup;
  optionalInformation: FormGroup;
  userService: UserService;

  constructor(userService: UserService, private _formBuilder: FormBuilder, public mediaObserver: MediaObserver, private _router: Router) {
    this.userService = userService;
  }

  controlValuesEqual(otherControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return otherControl.value !== control.value ? {'controlValueEquals': {value: true}} : null;
    };
  }

  usernameExists(userService: UserService): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors> => {
      return await userService.existsUser(control.value) ? {'usernameexists': {value: true}} : null;
    };
  }

  emailExists(userService: UserService): AsyncValidatorFn {
    return async (control: AbstractControl): Promise<ValidationErrors> => {
      return await userService.existsEmail(control.value) ? {'emailexists': {value: true}} : null;
    };
  }

  ngOnInit() {
    this.requiredInformation = this._formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeat_password: ['', [Validators.required]]
    });
    this.requiredInformation.get('repeat_password').setValidators(this.controlValuesEqual(this.requiredInformation.get('password')));
    this.requiredInformation.get('username').setAsyncValidators(this.usernameExists(this.userService));
    this.requiredInformation.get('email').setAsyncValidators(this.emailExists(this.userService));
    this.optionalInformation = this._formBuilder.group({
      realName: [''],
      birthday: [''],
      description: [''],
      occupation: ['']
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

  submitUserData() {
    const userToRegister: User = {
      birthday: this.optionalInformation.get('birthday').value,
      description: this.optionalInformation.get('description').value,
      email: this.requiredInformation.get('email').value,
      key: null,
      occupation: this.optionalInformation.get('occupation').value,
      password: this.requiredInformation.get('password').value,
      username: this.requiredInformation.get('username').value,
      realName: this.optionalInformation.get('realName').value,
    };
    this.userService.register(userToRegister).subscribe(value => {
      if (value !== null) {
        this.userService.login({
          username: userToRegister.username,
          password: userToRegister.password
        }).subscribe(loginSucceded => {
          if (loginSucceded) {
            this._router.navigate(['/']);
          }
        });
      }
    });
  }
}
