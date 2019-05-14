import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material";
import {CreateReportDialogComponent} from "./create-report-dialog/create-report-dialog.component";

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit {

  data = [];

  constructor(public dialog: MatDialog) {
    while (this.data.length < 20) {
      this.data.push(this.generateTestData());
    }
  }

  ngOnInit() {
  }

  counter = 1;

  generateTestData(): any {
    const numberOfTests = this.counter + 30;
    const passedTests = Math.floor(Math.random() * numberOfTests);
    return {
      number: this.counter++,
      numberOfTests: numberOfTests,
      passed: passedTests,
      failed: numberOfTests - passedTests,
      needReport: this.counter > 16
    };
  }

  openCreateReportDialog(): void {
    const dialogRef = this.dialog.open(CreateReportDialogComponent, {
      minWidth: '70%',
      minHeight: '70%'
    });
  }

}
