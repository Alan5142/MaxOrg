import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {MediaObserver} from '@angular/flex-layout';
import {GroupsService} from '../../../services/groups.service';

@Component({
  selector: 'app-change-description',
  templateUrl: './change-description.component.html',
  styleUrls: ['./change-description.component.scss']
})
export class ChangeDescriptionComponent implements OnInit {
  description: string;
  groupId: string;
  constructor(public dialogRef: MatDialogRef<ChangeDescriptionComponent>,
              public mediaObserver: MediaObserver,
              private groups: GroupsService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.groupId = data.groupId;
    groups.getGroupDescription(this.groupId).subscribe(description => {
      this.description = description;
    });
  }

  ngOnInit() {
  }

  updateDescription(newDescription: string) {
    this.groups.changeGroupDescription(this.groupId, newDescription);
    this.dialogRef.close();
  }
}
