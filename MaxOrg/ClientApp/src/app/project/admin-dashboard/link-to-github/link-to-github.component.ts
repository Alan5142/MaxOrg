import {Component, Inject, OnInit} from '@angular/core';
import {Repository} from "../../../services/user.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {MediaObserver} from "@angular/flex-layout";
import {GroupsService} from "../../../services/groups.service";

@Component({
  selector: 'app-link-to-github',
  templateUrl: './link-to-github.component.html',
  styleUrls: ['./link-to-github.component.scss']
})
export class LinkToGithubComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<LinkToGithubComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Repository[]) {
    console.log(data);
  }

  ngOnInit() {
  }

  returnGroupId(value: string) {
    const repo = this.data.find(repo => repo.fullName === value);
    this.dialogRef.close({id: repo.id});
  }
}
