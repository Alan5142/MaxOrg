import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Observable} from "rxjs";

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {

  uploadProgress = 0;

  constructor(public dialogRef: MatDialogRef<UploadFileComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    (this.data as Observable<number | boolean>).subscribe(result => {
      switch (typeof result) {
        case "number":
          this.uploadProgress = result;
          break;
        case "boolean":
          this.dialogRef.close();
          break;
      }
    });
  }

}
