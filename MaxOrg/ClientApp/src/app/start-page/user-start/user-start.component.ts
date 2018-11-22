import {Component, OnInit} from '@angular/core';
import {MatIconRegistry, MatDialog} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import { NewProjectComponent } from '../new-project/new-project.component';
import { FlexAlignDirective } from '@angular/flex-layout';

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

  constructor(public dialog: MatDialog) {}
  openDialog(): void {
    const dialogRef = this.dialog.open(NewProjectComponent, {
      width: '50%',
      minWidth:'300px'
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }
  ngOnInit() {
  }

}
