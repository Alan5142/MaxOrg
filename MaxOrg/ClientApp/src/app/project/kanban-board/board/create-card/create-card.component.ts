import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {KanbanCardsService} from '../../../../services/kanban-cards.service';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent implements OnInit {

  createCardForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CreateCardComponent>,
              private formBuilder: FormBuilder,
              private kanbanService: KanbanCardsService) {
    this.createCardForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(17)]],
      description: ['', [Validators.required, Validators.maxLength(30)]],
    });
  }

  ngOnInit() {
  }

  createCard() {
    this.createCardForm.get('title').markAsTouched();
    this.createCardForm.get('description').markAsTouched();

    if (!this.createCardForm.valid) {
      return;
    }
    this.kanbanService.createCardInSection(this.data.groupId, this.data.boardId, this.data.sectionId,
      {
        name: this.createCardForm.get('title').value,
        description: this.createCardForm.get('description').value
      }).subscribe(ok => this.dialogRef.close({valid: true}),
      error => this.dialogRef.close({valid: false}));
  }
}
