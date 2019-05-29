import {Component, Inject} from '@angular/core';
import {User, UserService} from "../../../services/user.service";
import {MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialogRef} from "@angular/material";
import {shareReplay} from "rxjs/operators";
import {GroupsService} from "../../../services/groups.service";

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss']
})
export class AddMembersComponent {
  selectedUsers: string[];
  autocompleteUsers: User[];

  constructor(public dialogRef: MatDialogRef<AddMembersComponent>,
              private userService: UserService,
              private groupService: GroupsService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selectedUsers = [];
    this.autocompleteUsers = [];
  }

  addMembers(): void {
    const returnPromise = this.groupService.addMembersToGroup(this.data.groupId, this.selectedUsers);
    this.dialogRef.close(returnPromise);
  }

  /**
   * Elimina a un usuario de la lista de selección de usuario
   * @param username Nombre del usuario a eliminar de la lista
   */
  remove(username: string): void {
    const index = this.selectedUsers.indexOf(username);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    }
  }

  valueChanged(value: string) {
    if (value.length > 2) {
      this.userService.getUsersByName(value, 7).pipe(shareReplay(1)).subscribe(users => {
        this.autocompleteUsers = users;
        const index = this.autocompleteUsers.findIndex(user => user.key === localStorage.getItem('userId'));
        if (index >= 0) {
          this.autocompleteUsers.splice(index, 1);
        }
      });
    } else {
      this.autocompleteUsers = [];
    }
  }

  userOption(event: MatAutocompleteSelectedEvent, userInput: HTMLInputElement) {
    const username: string = event.option.value.username;

    if (this.selectedUsers.indexOf(username) >= 0) {
      return;
    }

    this.selectedUsers.push(username);
    userInput.value = '';
  }
}
