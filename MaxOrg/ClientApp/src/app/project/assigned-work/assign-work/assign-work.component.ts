import { Component, OnInit, Inject } from '@angular/core';
import { TasksService, Task, CreateTaskRequest } from 'src/app/services/tasks.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assign-work',
  templateUrl: './assign-work.component.html',
  styleUrls: ['./assign-work.component.scss']
})
export class AssignWorkComponent implements OnInit {
  references: boolean = false;
  task: CreateTaskRequest;
  groupId: string;
  requirementId: string;
  url;
  date = (new FormControl(new Date())).value;

  constructor(public dialogRef: MatDialogRef<any>, private taskService: TasksService,
    @Inject(MAT_DIALOG_DATA) groupId: string,
    private router: Router, private route: ActivatedRoute) {
    this.groupId = groupId;
    this.requirementId = localStorage.getItem("taskRequirement");
    this.url = localStorage.getItem("url");

  }

  ngOnInit() {
    if (this.requirementId) {
      this.references = true;
    }
    localStorage.removeItem("taskGroup");
    localStorage.removeItem("url");


  }
  createTask(taskName: HTMLInputElement, taskDescription: HTMLInputElement) {
    if (this.references)
      this.task = {
        name: taskName.value,
        description: taskDescription.value,
        deliveryDate: this.date,
        referenceRequirement: this.requirementId
      }
    else
      this.task = {
        name: taskName.value,
        description: taskDescription.value,
        deliveryDate: this.date
      }
    console.log(this.task);

    this.dialogRef.close(this.taskService.createGroupTask(this.groupId, this.task));
  }
  unreference() {
    this.references = false;
    localStorage.removeItem("taskRequirement");
  }
  reference() {
    localStorage.setItem("taskGroup", this.groupId);
    this.router.navigate([this.url]);
    this.dialogRef.close();
  }
}
