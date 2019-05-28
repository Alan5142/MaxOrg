import {Component, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss']
})
export class TodosComponent implements OnInit {

  projects = [
    'user/proyecto',
    'user/proyecto2',
    'user/proyecto3',
  ];

  myTasks: Observable<any>;

  constructor(private userService: UserService) {
    this.myTasks = userService.pendingTasks.pipe(shareReplay(1));
  }

  ngOnInit() {
  }

}
