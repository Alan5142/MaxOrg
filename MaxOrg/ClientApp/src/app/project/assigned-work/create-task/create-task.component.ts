import {Component, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {CreateDialogComponent} from './create-dialog/create-dialog.component';
import {DeleteTaskDialogComponent} from './delete-task-dialog/delete-task-dialog.component';
import {EditTaskComponent} from './edit-task/edit-task.component';
@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit {
  displayedColumns: string[] = ['username', 'actions'];
  users: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog) {
    const dataTasks = Array.from({length: 15}, (_, k) => this.createNewTask(k + 1));

    this.users = new MatTableDataSource(dataTasks);
  }

  ngOnInit() {
    this.users.sort = this.sort;
    this.users.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.users.filter = filterValue.trim().toLowerCase();
    if (this.users.paginator) {
      this.users.paginator.firstPage();
    }
  }

 createNewTask(id: number) {
  return {
    id: id,
    name: 'Tarea' + id,
    description: 'descripción' + id,
    creationDate: new Date(),
    assignedDate: new Date(),
    progress: Math.floor(Math.random() * 100)
  };
}
}