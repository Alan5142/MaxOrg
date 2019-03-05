import {Component, OnInit} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import {User, UserService} from '../../services/user.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  passwordChanged = false;
  currentUser: User | null = null;
  fileData: string = null;

  constructor(private bottomSheet: MatBottomSheet, private userService: UserService) {
    userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
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
