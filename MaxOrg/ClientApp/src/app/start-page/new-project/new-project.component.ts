import {Component} from '@angular/core';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatDialogRef, MatSnackBar} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {User, UserService} from '../../services/user.service';
import {ProjectsService} from '../../services/projects.service';
import {FormGroup} from '@angular/forms';


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
              private projectService: ProjectsService,
              private snackBar: MatSnackBar) {
    this.selectedUsers = [];
    this.autocompleteUsers = [];
  }

  createProject(): void {
    this.projectService.createProject({name: this.projectName, members: this.selectedUsers}).subscribe(result => {
      this.snackBar.open('Creado con exito', 'Ok', {duration: 2500});
    }, error => {
      console.log(error);
      this.snackBar.open('No se pudo crear :(', 'Ok', {duration: 2500});
    });
    this.dialogRef.close();
  }

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
