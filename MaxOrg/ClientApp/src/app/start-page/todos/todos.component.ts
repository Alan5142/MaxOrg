import {Component, OnInit} from '@angular/core';

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

  constructor() {
  }

  ngOnInit() {
  }

}
