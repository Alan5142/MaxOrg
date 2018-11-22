import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';


@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent  {
  constructor(
    public dialogRef: MatDialogRef<NewProjectComponent>){
      
    }

  onNoClick(): void {
    this.dialogRef.close();
  }
  

}
