import { Component, OnInit } from '@angular/core';
import {MatDialog} from "@angular/material";
import {CreateTestDialogComponent} from "./create-test-dialog/create-test-dialog.component";

@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.scss']
})
export class CreateTestComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  queueTest() {
    this.dialog.open(CreateTestDialogComponent);
  }
}
