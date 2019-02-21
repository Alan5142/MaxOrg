import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent implements OnInit {
  members: any = [{name: 'Alan'}, {name: 'Manuel'}];
  description = '';

  constructor(
    public dialogRef: MatDialogRef<GroupCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }
}
