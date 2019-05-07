import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {KanbanMemberPermissions} from "../../../services/kanban-cards.service";

@Component({
  selector: 'app-modify-members',
  templateUrl: './modify-members.component.html',
  styleUrls: ['./modify-members.component.scss']
})
export class ModifyMembersComponent implements OnInit {
  KanbanMemberPermissions = KanbanMemberPermissions;
  filterList = [];

  constructor(public dialogRef: MatDialogRef<ModifyMembersComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
  }

  addUser(username: string, memberPermissions: KanbanMemberPermissions) {
    if (this.data.members.findIndex(value => {
      return value.user === username;
    }) !== -1) {
      return;
    }

    const user = (this.data.groupMembers as Array<any>).find(value => {
      return value.username === username
    });

    if (memberPermissions === KanbanMemberPermissions.Admin) {
      return;
    }
    if (user === undefined)
      return;
    this.data.members.push({user: username, profilePicture: user.profilePicture, memberPermissions: Number(memberPermissions)});
  }

  removeUser(index: number) {
    const data = (this.data.members as Array<any>).splice(index, 1);
  }

  onUserNameChange($event: any) {
    if ($event.target.value.length > 3) {
      this.filterList = (this.data.groupMembers as Array<any>).filter(value => {
        return (this.data.members as Array<any>).findIndex(val => val.user === value.username) === -1;
      }).filter((value, index) => {
        return (value.username as string).toLowerCase().includes($event.target.value.toLowerCase());
      });
    }
  }
}
