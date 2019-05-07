import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-card-delete',
  templateUrl: './card-delete.component.html',
  styleUrls: ['./card-delete.component.scss']
})
export class CardDeleteComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CardDeleteComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }
}
