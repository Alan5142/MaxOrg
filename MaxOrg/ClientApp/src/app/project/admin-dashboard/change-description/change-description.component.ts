import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {MediaObserver} from '@angular/flex-layout';
import {GroupsService} from '../../../services/groups.service';
import {Observable} from "rxjs";
import {share} from "rxjs/operators";

@Component({
  selector: 'app-change-description',
  templateUrl: './change-description.component.html',
  styleUrls: ['./change-description.component.scss']
})
export class ChangeDescriptionComponent implements OnInit {
  description: Observable<string>;
  groupId: string;

  constructor(public dialogRef: MatDialogRef<ChangeDescriptionComponent>,
              public mediaObserver: MediaObserver,
              private groups: GroupsService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.groupId = data.groupId;
    this.description = groups.getGroupDescription(this.groupId).pipe(share());
  }

  ngOnInit() {
  }

  updateDescription(newDescription: string) {
    this.groups.changeGroupDescription(this.groupId, newDescription);
    this.dialogRef.close(newDescription);
  }
}
