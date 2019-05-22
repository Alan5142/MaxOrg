import {Component, Inject, OnInit} from '@angular/core';
import {MediaObserver} from "@angular/flex-layout";
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";
import {TestsService} from "../../../../services/tests.service";

@Component({
  selector: 'app-create-report-dialog',
  templateUrl: './create-report-dialog.component.html',
  styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit {
  description: string;
  groupId: string;
  testId: string;

  constructor(public dialogRef: MatDialogRef<CreateReportDialogComponent>,
              public mediaObserver: MediaObserver,
              private testsService: TestsService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private snackbar: MatSnackBar) {
    this.groupId = data.groupId;
    this.testId = data.testId;
  }

  ngOnInit() {
  }

  updateDescription(newDescription: string) {
    this.testsService.updateReport(this.groupId, this.testId, newDescription).subscribe(() => {
      this.snackbar.open('Reporte creado con exito', 'Ok', {duration: 2000});
      this.dialogRef.close();
    }, () => {
      this.snackbar.open('No se pudo crear el reporte', 'Ok', {duration: 2000});
      this.dialogRef.close();

    });
  }

}
