import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";

@Component({
  selector: 'app-github-login',
  templateUrl: './github-login.component.html',
  styleUrls: ['./github-login.component.scss']
})
export class GithubLoginComponent implements OnInit {
  public codeParam: string;
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
              private _formBuilder: FormBuilder) {
  }

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
      console.log(params);
      this.codeParam = params.get('code');
      if (this.codeParam) {
        this.userService.githubInfo(this.codeParam).subscribe(result => {
          if (result.token !== undefined) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('userId', result.refreshToken);
            this.router.navigate(['/']);
          }
          this.requiredInformation.get('username').setValue(result.username);
          this.requiredInformation.get('email').setValue(result.email);
          this.requiredInformation.get('description').setValue(result.description);
          this.requiredInformation.get('username').markAsTouched();
          this.requiredInformation.get('email').markAsTouched();
          this.profilePicture = result.picture;
          this.userId = result.userId;
        }, error => {
          console.log(error);
          this.router.navigate(['/']);
        });
      }
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

  createUserWithGithub() {
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

    this.userService.githubLogin(request).subscribe(result => {
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('userId', result.refreshToken);
      this.router.navigate(['/']);
    });
  }
}
