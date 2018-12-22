import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {NewProjectComponent} from '../new-project/new-project.component';
import {MediaObserver} from '@angular/flex-layout';
import {User, UserService} from '../../services/user.service';

@Component({
  selector: 'app-user-start',
  templateUrl: './user-start.component.html',
  styleUrls: ['./user-start.component.scss']
})
export class UserStartComponent implements OnInit {
  currentUser: User | null = null;
  projects = [
    'Usuario/Proyecto1',
    'Usuario/Proyecto2',
    'Usuario2/Proyecto3'
  ];

  constructor(public dialog: MatDialog, public mediaObserver: MediaObserver, public userService: UserService) {
    userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NewProjectComponent, {
      width: '50%',
      minWidth: '300px'
    });

    dialogRef.afterClosed().subscribe(() => {
    });
  }

  ngOnInit() {
  }

}
