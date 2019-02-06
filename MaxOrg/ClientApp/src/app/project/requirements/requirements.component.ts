import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent implements OnInit {
  displayedColumns: string[] = ['number', 'description', 'createdAt', 'isCompleted'];

  dataSource = [
    {number: 1, description: 'Requerimiento 1', createdAt: new Date(), isCompleted: true},
    {number: 2, description: 'Requerimiento 2', createdAt: new Date(), isCompleted: true},
    {number: 3, description: 'Requerimiento 3', createdAt: new Date(), isCompleted: true},
    {number: 4, description: 'Requerimiento 4', createdAt: new Date(), isCompleted: false},
    {number: 5, description: 'Requerimiento 5', createdAt: new Date(), isCompleted: true},
    {number: 6, description: 'Requerimiento 6', createdAt: new Date(), isCompleted: false},
    {number: 7, description: 'Requerimiento 7', createdAt: new Date(), isCompleted: false},
    {number: 8, description: 'Requerimiento 8', createdAt: new Date(), isCompleted: false},
    {number: 9, description: 'Requerimiento 9', createdAt: new Date(), isCompleted: false},
    {number: 10, description: 'Requerimiento 10', createdAt: new Date(), isCompleted: false},
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
