import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-create-section',
  templateUrl: './create-section.component.html',
  styleUrls: ['./create-section.component.scss']
})
export class CreateSectionComponent implements OnInit {
  createSectionForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<CreateSectionComponent>,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.createSectionForm = this.formBuilder.group({
      sectionName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(15)]]
    });
  }

  createSection() {
    this.createSectionForm.get('sectionName').markAsDirty();
    console.log(this.createSectionForm.get('sectionName'));
    if (!this.createSectionForm.valid) {
      return;
    }
    this.dialogRef.close({sectionName: this.createSectionForm.get('sectionName').value});
  }
}
