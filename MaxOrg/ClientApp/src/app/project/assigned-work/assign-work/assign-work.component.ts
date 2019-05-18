import {Component, OnInit, Inject} from '@angular/core';
import { TasksService, Task, CreateTaskRequest } from 'src/app/services/tasks.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-assign-work',
  templateUrl: './assign-work.component.html',
  styleUrls: ['./assign-work.component.scss']
})
export class AssignWorkComponent implements OnInit {
  task:CreateTaskRequest;
  groupId:string;
  constructor(public dialogRef:MatDialogRef<any>,private taskService:TasksService,
               @Inject(MAT_DIALOG_DATA)  groupId: string) {
    this.groupId=groupId;
  }

  ngOnInit() {
  }
  createTask(taskName:HTMLInputElement,taskDescription:HTMLInputElement){
    this.task={
      name:taskName.value,
      description:taskDescription.value
    }
    
    this.dialogRef.close(this.taskService.createGroupTask(this.groupId,this.task));
  }

}
