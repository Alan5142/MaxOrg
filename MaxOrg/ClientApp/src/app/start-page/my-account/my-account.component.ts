import {Component, OnInit, ViewChild} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef, MatSlideToggleChange, MatSnackBar} from '@angular/material';
import {NotificationPreference, User, UserService} from '../../services/user.service';
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/operators";
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {ImageCropperComponent, CropperSettings} from 'ngx-img-cropper';
import {MediaObserver} from "@angular/flex-layout";
import {environment} from "../../../environments/environment";
import {ThemeService} from "../../services/theme.service";

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  private cropper: ImageCropperComponent;

  @ViewChild('imageCropper') set content(content: ImageCropperComponent) {
    this.cropper = content;
    if (this.cropper !== undefined && this.fileData !== null) {
      this.cropper.setImage(this.fileData);
    }
  }

  private newUserImage: boolean = false;
  cropperSettings: CropperSettings;
  private data: any;

  passwordChanged = false;
  currentUser: User | null = null;
  fileData = null;
  userNotificationPreference: Observable<NotificationPreference>;
  userDataForm: FormGroup;
  profileUrl = '';


  constructor(private bottomSheet: MatBottomSheet,
              private userService: UserService,
              private formBuilder: FormBuilder,
              public theme: ThemeService,
              private snackBar: MatSnackBar,
              mediaObserver: MediaObserver) {

    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 100;
    this.cropperSettings.height = 100;
    this.cropperSettings.croppedWidth = 512;
    this.cropperSettings.croppedHeight = 512;
    this.cropperSettings.canvasWidth = 330;
    this.cropperSettings.canvasHeight = 300;
    this.cropperSettings.fileType = 'image/jpeg';
    this.cropperSettings.rounded = true;
    this.cropperSettings.noFileInput = true;
    if (mediaObserver.isActive('lt-md')) {
      this.cropperSettings.dynamicSizing = true;
    }
    this.data = {};

    userService.getCurrentUser().subscribe(user => {
      this.profileUrl = user.profilePicture + `?dummy=${Math.random()}`;
      this.currentUser = user;
    });
    this.userNotificationPreference = userService.userPreferences;

    this.userDataForm = this.formBuilder.group({
      realName: '',
      description: '',
      password: ['', [Validators.minLength(8)]],
      repeatPassword: '',
      occupation: '',
      preferences: ''
    });

    this.userDataForm.get('password').setValidators(this.matchValidator('repeatPassword'));
  }

  ngOnInit() {
  }

  selectImage() {
    this.bottomSheet.open(MyAccountPickImageComponent).afterDismissed().subscribe(result => {
      if (result) {
        this.fileData = result;
        this.newUserImage = true;
      }
    });
  }

  matchValidator(otherComponent: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const repeatPasswordControl = control.root.get(otherComponent);
      return control.value !== repeatPasswordControl.value ? {'mismatch': {value: true}} : null;
    };
  }

  checkPasswords() {
    this.userDataForm.get('password').updateValueAndValidity();
  }

  updateUserData() {
    let formData = new FormData();
    formData.append('hola', 'qweqe');
    const realName = this.userDataForm.get('realName');
    if (realName.value !== '') {
      formData.append('realName', realName.value);
    }
    const description = this.userDataForm.get('description');
    if (description.value !== '') {
      formData.append('description', description.value);
    }
    const password = this.userDataForm.get('password');
    if (password.value !== '') {
      formData.append('password', password.value);
    }
    const occupation = this.userDataForm.get('occupation');
    if (occupation.value !== '') {
      formData.append('occupation', occupation.value);
    }
    const preferences = this.userDataForm.get('preferences');
    if (preferences.value !== '') {
      formData.append('preferences', preferences.value);
    }
    if (this.data.image !== undefined) {
      formData.append('profilePictureAsBase64', this.data.image.substring(this.data.image.indexOf(',') + 1));
    }
    this.userService.updateUserInfo(formData).subscribe(() =>
      this.snackBar.open('Información actualizada con exito', 'OK', {
      duration: 2000,
    }), error => this.snackBar.open('No se pudo actualizar la información', 'OK', {
      duration: 2000,
    }));
  }

  changeTheme($event: MatSlideToggleChange) {
    this.theme.darkTheme = $event.checked;
  }
}

@Component({
  selector: 'app-my-account-pick-image',
  templateUrl: 'my-account-pick-image.html',
})
export class MyAccountPickImageComponent {
  constructor(private bottomSheetRef: MatBottomSheetRef<MyAccountPickImageComponent>) {
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  openFile(event: MouseEvent): void {
    document.getElementById('fileToUpload').click();
    event.preventDefault();
  }

  onFileChanged(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      const file = event.target.files[0];


      reader.onloadend = ev => {
        const image = new Image();
        image.src = (reader.result as any);
        this.bottomSheetRef.dismiss(image);
      };
      reader.readAsDataURL(file);
      return;
    }
    this.bottomSheetRef.dismiss();
  }
}
