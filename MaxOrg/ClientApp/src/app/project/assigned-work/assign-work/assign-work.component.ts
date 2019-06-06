import {Component, Inject, OnInit} from '@angular/core';
import {CreateTaskRequest, TasksService} from 'src/app/services/tasks.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-assign-work',
  templateUrl: './assign-work.component.html',
  styleUrls: ['./assign-work.component.scss']
})
export class AssignWorkComponent implements OnInit {
  references: boolean = false;
  task: CreateTaskRequest;
  id: string;
  isUser:boolean;
  requirementId: string;
  percent;
  projectId;
  date = (new FormControl(new Date())).value;

  constructor(public dialogRef: MatDialogRef<any>, private taskService: TasksService,
    @Inject(MAT_DIALOG_DATA) params: any,
    private router: Router, private route: ActivatedRoute) {
    this.id = params.id;
    this.isUser=params.isUser;
    this.requirementId = localStorage.getItem("taskRequirement");
    this.projectId = localStorage.getItem("projectId");

  }

  ngOnInit() {
    if (this.requirementId) {
      this.references = true;
    }
    localStorage.removeItem("taskTarget");
    localStorage.removeItem("projectId");


  }
  createTask(taskName: HTMLInputElement, taskDescription: HTMLInputElement) {
    this.task=null;
    if (this.references){
    if(Number.isInteger(this.percent)&&this.percent>0&&this.percent<=100)
    this.task = {
      name: taskName.value,
      description: taskDescription.value,
      deliveryDate: this.date,
      referenceRequirement: this.requirementId,
      contributionPercentage: this.percent.toString()
    }
    else if(this.percent==null)
    this.task = {
      name: taskName.value,
      description: taskDescription.value,
      deliveryDate: this.date,
      referenceRequirement: this.requirementId
    }
  }
    else
      this.task = {
        name: taskName.value,
        description: taskDescription.value,
        deliveryDate: this.date
      };
    if(!this.isUser){
      this.dialogRef.close(this.taskService.createGroupTask(this.id,this.task));
    }else{
      this.task.userAssignId=this.id;
      this.dialogRef.close(this.taskService.createGroupTask(this.projectId,this.task));
    }

  }
  unreference() {
    this.references = false;
    localStorage.removeItem("taskRequirement");
  }
  reference() {
    localStorage.setItem("taskTarget", this.id);
    this.router.navigate(['/project/'+this.projectId+'/requirements']);
    this.dialogRef.close();
  }
}
