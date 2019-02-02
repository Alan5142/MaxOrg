import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';


@Component({
  selector: 'app-group-card',
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GroupCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string) {console.log(data);}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }
  members: any=[{name:'Alan'},{name:'Manuel'}]
}
