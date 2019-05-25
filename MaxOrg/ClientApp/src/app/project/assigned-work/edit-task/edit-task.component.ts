import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TasksService } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {
  newProgress;
  constructor(private dialogRef:MatDialogRef<EditTaskComponent>,@Inject(MAT_DIALOG_DATA) public data: any, private taskService:TasksService) {
      this.newProgress=data.task.progress;
   }
  editTask(){
    if(this.newProgress==this.data.task.progress)
      this.dialogRef.close();
    else{
      this.taskService.modifyGroupTask(this.data.groupId,{newProgress:this.newProgress,id:this.data.task.id});
      this.dialogRef.close(this.newProgress);}
  }
  ngOnInit() {
  }

}
