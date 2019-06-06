import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material";
import {CreateReportDialogComponent} from "./create-report-dialog/create-report-dialog.component";
import {TestsService} from "../../../services/tests.service";
import {merge, Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {shareReplay} from "rxjs/operators";
import {CreateTestDialogComponent} from "../create-test/create-test-dialog/create-test-dialog.component";
import {ReadOnlyService} from "../../services/read-only.service";

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit {

  data = [];

  tests: Observable<any>;

  groupId: string;

  constructor(public dialog: MatDialog,
              private testsService: TestsService,
              private activatedRoute: ActivatedRoute,
              public readOnly: ReadOnlyService) {
    while (this.data.length < 20) {
      this.data.push(this.generateTestData());
    }
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.groupId = params['id'];
      this.tests = testsService.getTests(this.groupId).pipe(shareReplay(1));
    });
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

  openCreateReportDialog(id: string): void {
    const dialogRef = this.dialog.open(CreateReportDialogComponent, {
      minWidth: '70%',
      minHeight: '70%',
      data: {
        groupId: this.groupId,
        testId: id
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      const newTests = this.testsService.getTests(this.groupId).pipe(shareReplay(1));
      this.tests = merge(this.tests, newTests);
    });
  }

  queueTest() {
    const dialogRef = this.dialog.open(CreateTestDialogComponent, {data: {id: this.groupId}});
    dialogRef.afterClosed().subscribe(() => {
      const newTests = this.testsService.getTests(this.groupId).pipe(shareReplay(1));
      this.tests = merge(this.tests, newTests);
    });
  }
}
