import {Component, OnInit} from '@angular/core';
import { TasksService, Task, CreateTaskRequest } from 'src/app/services/tasks.service';

@Component({
  selector: 'app-assign-work',
  templateUrl: './assign-work.component.html',
  styleUrls: ['./assign-work.component.scss']
})
export class AssignWorkComponent implements OnInit {
  task:CreateTaskRequest;
  constructor(private taskService:TasksService) {
    console.log(taskService.createGroupTask("257829",{name:"jugar",description:"jugar"}));
  }

  ngOnInit() {
  }

}
