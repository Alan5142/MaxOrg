import {Component} from '@angular/core';
import {MatAutocompleteSelectedEvent, MatDialogRef} from '@angular/material';
import {User, UserService} from '../../services/user.service';
import {ProjectsService} from '../../services/projects.service';


@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent {
  projectName: string;
  selectedUsers: string[];
  autocompleteUsers: User[];

  constructor(public dialogRef: MatDialogRef<NewProjectComponent>,
              private userService: UserService,
              private projectService: ProjectsService) {
    this.selectedUsers = [];
    this.autocompleteUsers = [];
  }

  createProject(): void {
    const returnPromise = this.projectService.createProject({name: this.projectName, members: this.selectedUsers});
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
}
