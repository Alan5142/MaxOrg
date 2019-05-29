import {Component, Inject} from '@angular/core';
import {User, UserService} from "../../../services/user.service";
import {MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialogRef} from "@angular/material";
import {ProjectsService} from "../../../services/projects.service";
import {shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-new-derived-project',
  templateUrl: './new-derived-project.component.html',
  styleUrls: ['./new-derived-project.component.scss']
})
export class NewDerivedProjectComponent {
  projectName: string;
  selectedUsers: string[];
  autocompleteUsers: User[];

  constructor(public dialogRef: MatDialogRef<NewDerivedProjectComponent>,
              private userService: UserService,
              private projectService: ProjectsService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.selectedUsers = [];
    this.autocompleteUsers = [];
  }

  createProject(): void {
    const returnPromise = this.projectService.createProject({
      name: this.projectName,
      members: this.selectedUsers,
      previousProject: this.data.projectId
    });
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
