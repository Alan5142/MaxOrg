import {Component, OnInit} from '@angular/core';
import {MatBottomSheet} from '@angular/material';
import {MatBottomSheetRef} from '@angular/material';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  passwordChanged = false;

  constructor(private bottomSheet: MatBottomSheet) {
  }

  ngOnInit() {
  }

  selectImage() {
    this.bottomSheet.open(MyAccountPickImageComponent);
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
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
