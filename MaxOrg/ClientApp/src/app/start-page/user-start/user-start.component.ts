import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-user-start',
  templateUrl: './user-start.component.html',
  styleUrls: ['./user-start.component.scss']
})
export class UserStartComponent implements OnInit {

  projects = [
    'Usuario/Proyecto1',
    'Usuario/Proyecto2',
    'Usuario2/Proyecto3'
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
