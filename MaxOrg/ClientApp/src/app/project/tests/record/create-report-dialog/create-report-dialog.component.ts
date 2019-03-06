import { Component, OnInit } from '@angular/core';
import {MediaObserver} from "@angular/flex-layout";

@Component({
  selector: 'app-create-report-dialog',
  templateUrl: './create-report-dialog.component.html',
  styleUrls: ['./create-report-dialog.component.scss']
})
export class CreateReportDialogComponent implements OnInit {

  public report: string = '';

  constructor(public mediaObserver: MediaObserver) { }

  ngOnInit() {
  }

}
