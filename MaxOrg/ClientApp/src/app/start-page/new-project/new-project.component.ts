import {Component} from '@angular/core';
import {MatChipInputEvent, MatDialogRef} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {COMMA, ENTER} from '@angular/cdk/keycodes';


@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent {

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  usernames: string[];

  constructor(public dialogRef: MatDialogRef<NewProjectComponent>) {
    this.usernames = [];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addUser(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.usernames.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(username: string): void {
    const index = this.usernames.indexOf(username);

    if (index >= 0) {
      this.usernames.splice(index, 1);
    }
  }
}
