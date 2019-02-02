import {Component, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {CreateDialogComponent} from './create-dialog/create-dialog.component';
import {DeleteTaskDialogComponent} from './delete-task-dialog/delete-task-dialog.component';
import {EditTaskComponent} from './edit-task/edit-task.component';

interface Task {
  id: Number;
  name: string;
  description: string;
  creationDate: Date;
  assignedDate?: Date;
  progress?: number;
}

@Component({
  selector: 'app-create-task',
  templateUrl: './create-task.component.html',
  styleUrls: ['./create-task.component.scss']
})
export class CreateTaskComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'description', 'creationDate', 'assignedDate', 'progress', 'actions'];
  tasks: MatTableDataSource<Task>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(mediaObserver: MediaObserver, public dialog: MatDialog) {
    const dataTasks = Array.from({length: 15}, (_, k) => createNewTask(k + 1));

    this.tasks = new MatTableDataSource(dataTasks);
  }

  ngOnInit() {
    this.tasks.sort = this.sort;
    this.tasks.paginator = this.paginator;
  }

  formatDate(date: Date): string {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  applyFilter(filterValue: string) {
    this.tasks.filter = filterValue.trim().toLowerCase();
    if (this.tasks.paginator) {
      this.tasks.paginator.firstPage();
    }
  }

  openCreateTask() {
    const dialogRef = this.dialog.open(CreateDialogComponent, {
      width: '250px',
      maxWidth: '400px',
      data: null
    });
  }

  deleteTask() {
    const dialogRef = this.dialog.open(DeleteTaskDialogComponent, {
      minWidth: '300px',
      data: null
    });
  }

  editTask() {
    const dialogRef = this.dialog.open(EditTaskComponent, {
      data: null
    });
  }
}

function createNewTask(id: number): Task {
  return {
    id: id,
    name: 'Tarea' + id,
    description: 'descripción' + id,
    creationDate: new Date(),
    assignedDate: new Date(),
    progress: Math.floor(Math.random() * 100)
  };
}
