import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {MediaChange, MediaObserver} from '@angular/flex-layout';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  requiredInformation: FormGroup;
  optionalInformation: FormGroup;
  userService: UserService;
  controlValuesEqual(otherControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      console.log(this.requiredInformation);
      return otherControl.value !== control.value ? {'controlValueEquals': {value: true}} : null;
    };
  }

  usernameExists(userService: UserService): AsyncValidatorFn {
    return async (control: AbstractControl): Observable<ValidationErrors | null> |  null => {
      return await userService.existsUser(control.value) ? {'usernameexists': {value: true}} : null;
    };
  }

  constructor(userService: UserService, private _formBuilder: FormBuilder, public mediaObserver: MediaObserver) {
    this.userService = userService;
  }

  ngOnInit() {
    this.requiredInformation = this._formBuilder.group( {
      username: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeat_password: ['', [Validators.required]]
    });
    this.requiredInformation.get('repeat_password').setValidators(this.controlValuesEqual(this.requiredInformation.get('password')));
    this.requiredInformation.get('username').setAsyncValidators(this.usernameExists(this.userService))
    this.optionalInformation = this._formBuilder.group( {
      realName: [''],
      birthday: [''],
      description: [''],
      occupation: ['']
    });
  }
}
