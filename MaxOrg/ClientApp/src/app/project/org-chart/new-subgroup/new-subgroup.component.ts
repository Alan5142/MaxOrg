import { Component, Input, Inject } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { User, UserService } from 'src/app/services/user.service';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-new-subgroup',
  templateUrl: './new-subgroup.component.html',
  styleUrls: ['./new-subgroup.component.scss']
})
export class NewSubgroupComponent {
  groupName: string;
  groupDescription:string="";
  selectedUsers: string[];
  selectedAdmin=null;
  autocompleteUsers: User[];
  subgroupAdminId:string;
  parentGroupId:string;
  constructor(public dialogRef: MatDialogRef<NewSubgroupComponent>,
              private userService: UserService,
              private groupService: GroupsService,
              @Inject(MAT_DIALOG_DATA)  parentGroupId: string) {
    this.parentGroupId=parentGroupId;
    console.log(parentGroupId);
    this.selectedUsers = [];
    this.autocompleteUsers = [];
    userService.getCurrentUser().subscribe(user=>this.selectedAdmin=user.username);
  }

  createGroup(): void {
    let adminId;
    this.userService.getUsersByName(this.selectedAdmin,1).subscribe(admin=>{
      const itf = {currentGroupId:((this.parentGroupId as any).parentId as string),name:this.groupName,description:this.groupDescription,members:this.selectedUsers,subgroupAdminId:admin[0].key};
      console.log(itf)
      const returnPromise = this.groupService.createGroup(itf);
      //this.dialogRef.close(returnPromise);
      console.log(returnPromise);
      returnPromise.subscribe(r => this.dialogRef.close());
    })
   
   
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
      this.userService.getUsersByName(value, 7).subscribe(users => {
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
  adminSelected(event: MatAutocompleteSelectedEvent, adminInput: HTMLInputElement) {
    const username: string = event.option.value.username;

    if (this.selectedUsers.indexOf(username) >= 0) {
      return;
    }

    this.selectedAdmin=username;
    console.log(this.selectedAdmin);
  }
}
