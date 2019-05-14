import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatDialogRef
} from "@angular/material";
import {CardDetailedComponent} from "../../kanban-board/board/card-detailed/card-detailed.component";
import {User} from "../../../services/user.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-create-chat-group',
  templateUrl: './create-chat-group.component.html',
  styleUrls: ['./create-chat-group.component.scss']
})
export class CreateChatGroupComponent implements OnInit {

  addedMembers: User[] = [];
  membersControl = new FormControl();
  formGroup: FormGroup;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('memberInput') memberInput: ElementRef<HTMLInputElement>;

  constructor(public dialogRef: MatDialogRef<CardDetailedComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      chatName: ['', Validators.required]
    })
  }

  ngOnInit() {
  }

  removeMember(member: string) {
    const index = this.addedMembers.findIndex(user => user.username === member);
    if (index < 0) {
      this.addedMembers.splice(index, 1);
    }
  }

  get filteredMembers() {
    return (this.data.members as Array<any>).filter(value => {
      return this.addedMembers.findIndex(val => val.username === value.username) === -1;
    }).filter(value => value.username.toLowerCase().trim().includes(this.memberInput.nativeElement.value.toLowerCase().trim()));
  }

  addMember(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;
    if (!this.matAutocomplete.isOpen) {
      if ((value || '').trim()) {
        const index = (this.data.members as Array<any>).findIndex(u => u.username === value.trim());

        this.addedMembers.push(this.data.members[index]);
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.membersControl.setValue(null);
    }
  }

  selected($event: MatAutocompleteSelectedEvent) {
    console.log('autocomplete event');
    this.memberInput.nativeElement.value = '';
    this.membersControl.setValue(null);
    const index = (this.data.members as Array<any>).findIndex(u => u.username === $event.option.value.trim());

    this.addedMembers.push(this.data.members[index]);
  }

  sendData() {
    this.formGroup.get('chatName').markAsDirty();
    if (this.formGroup.valid) {
      const memberIds = this.addedMembers.map(u => u.key);
      this.dialogRef.close({name: this.formGroup.get('chatName').value, members: memberIds});
    }
  }
}
