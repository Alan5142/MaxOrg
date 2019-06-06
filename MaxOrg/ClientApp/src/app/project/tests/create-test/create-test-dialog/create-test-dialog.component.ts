import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";
import {TestsService} from "../../../../services/tests.service";
import {Observable} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-create-test-dialog',
  templateUrl: './create-test-dialog.component.html',
  styleUrls: ['./create-test-dialog.component.scss']
})
export class CreateTestDialogComponent implements OnInit {

  createTestForm: FormGroup;
  buildDefinitions: Observable<any[]>;

  constructor(public dialogRef: MatDialogRef<CreateTestDialogComponent>,
              private testsService: TestsService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private snackbar: MatSnackBar) {
    this.buildDefinitions = this.testsService.getBuildDefinitions(data.id);

  }

  ngOnInit() {
    this.createTestForm = this.fb.group({
      name: ['', [Validators.required]],
      buildDefinition: ['', [Validators.required]]
    });
  }

  createTest() {
    this.testsService
      .createTest(this.data.id, this.createTestForm.get('buildDefinition').value, this.createTestForm.get('name').value)
      .subscribe(() => {
        this.snackbar.open('Encolado con éxito, vuelve en un rato para ver los resultados', 'Ok', {duration: 5000});
        this.dialogRef.close();
    }, () => {
        this.snackbar.open('Encolado con éxito, vuelve en un rato para ver los resultados', 'Ok', {duration: 5000});
        this.dialogRef.close();
      });
  }
}
