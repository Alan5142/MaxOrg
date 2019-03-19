import {Component, OnInit} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import {NotificationPreference, User, UserService} from '../../services/user.service';
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  passwordChanged = false;
  currentUser: User | null = null;
  fileData: string = null;
  userNotificationPreference: Observable<NotificationPreference>;

  constructor(private bottomSheet: MatBottomSheet, private userService: UserService) {
    userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.userNotificationPreference = userService.userPreferences.pipe(shareReplay(1));
    this.userNotificationPreference.subscribe(r => console.log(r.toString()));
  }

  ngOnInit() {
  }

  selectImage() {
    this.bottomSheet.open(MyAccountPickImageComponent).afterDismissed().subscribe(result => {
      if (result) {
        this.fileData = result;
      }
    });
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
      reader.readAsDataURL(file);
      reader.onloadend = ev => {
        this.bottomSheetRef.dismiss(reader.result);
      };
      return;
    }
    this.bottomSheetRef.dismiss();
  }
}
