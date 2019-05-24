import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialogRef, MatDialog } from '@angular/material';
import { User, UserService } from 'src/app/services/user.service';
import { GroupsService } from 'src/app/services/groups.service';
import { componentFactoryName } from '@angular/compiler';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-new-subgroup',
  templateUrl: './new-subgroup.component.html',
  styleUrls: ['./new-subgroup.component.scss']
})
export class NewSubgroupComponent {
  groupName: string;
  groupDescription: string = "";
  selectedUsers: string[];
  selectedAdmin = null;
  autocompleteUsers: User[];
  subgroupAdminId: string;
  parentGroupId: string;

  @ViewChild('adminInput') adminInput: HTMLInputElement;

  constructor(public dialogRef: MatDialogRef<NewSubgroupComponent>,
    private userService: UserService,
    private groupService: GroupsService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) parentGroupId: string) {
    this.parentGroupId = parentGroupId;
    console.log(parentGroupId);
    this.selectedUsers = [];
    this.autocompleteUsers = [];
    userService.getCurrentUser().subscribe(user => this.selectedAdmin = user.username);
  }

  createGroup(): void {
    let adminId;
    this.userService.getUsersByName(this.selectedAdmin, 1).subscribe(admin => {
      const itf = { currentGroupId: ((this.parentGroupId as any).parentId as string), name: this.groupName, description: this.groupDescription, members: this.selectedUsers, subgroupAdminId: admin[0].key };
      const returnPromise = this.groupService.createGroup(itf);
      returnPromise.subscribe(r => this.dialogRef.close(returnPromise));

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

    this.selectedAdmin = username;
    console.log(this.selectedAdmin);
  }
  addDescription() {
    const dialogRef = this.dialog.open(addDescription, {
      data: { description: this.groupDescription, groupId:this.parentGroupId }
    });
    dialogRef.afterClosed().subscribe(description => {
      if (description)
        this.groupDescription = description;
      console.log(this.groupDescription);
    });
  }
}
@Component({
  template: '<app-markdown-editor (saveClicked)="dialogRef.close($event)"' +
    'title="Añadir descripción"' +
    'okButtonText="AÑADIR DESCRIPCIÓN"' +
    '[defaultText]="description"' +
    '[groupId]="groupId"' +
    '(onCancel)="dialogRef.close(null)">' +
    '</app-markdown-editor>'
})
export class addDescription {
  description:Observable<string>;
  groupId:string;
  constructor(private dialogRef: MatDialogRef<addDescription>,
      @Inject(MAT_DIALOG_DATA) data:any) {
        console.log(data);
        this.description= of(data.description);
        this.groupId= data.groupId.parentId;
        console.log(this.groupId);
       }
}

