import {Component, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {GoogleChartComponent} from 'ng2-google-charts';
import {MatDialog} from '@angular/material';
import {ChangeDescriptionComponent} from './change-description/change-description.component';
import {ActivatedRoute} from '@angular/router';
import * as marked from 'marked/marked.min.js';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  @ViewChild('tasksChart') tasksChart: GoogleChartComponent;
  groupId: string;

  pieChartData = {
    chartType: 'LineChart',
    dataTable: [
      ['Intervalo', 'Tareas'],
      [new Date(2019, 0, 5), 0],
      [new Date(2019, 0, 6), 2],
      [new Date(2019, 0, 7), 5],
      [new Date(2019, 0, 8), 0],
      [new Date(2019, 0, 9), 3],
      [new Date(2019, 0, 10), 2],
      [new Date(2019, 0, 11), 0]
    ],
    options: {explorer: {axis: 'horizontal', keepInBounds: true}, hAxis: {format: ' dd/MM/yyyy'}, height: '1900px'}
  };

  constructor(public mediaObserver: MediaObserver,
              public dialog: MatDialog,
              public route: ActivatedRoute) {
    route.parent.params.subscribe(params => {
      this.groupId = params['id'];
    });
  }

  ngOnInit() {
  }

  changeDescription() {
    const dialogRef = this.dialog.open(ChangeDescriptionComponent, {
      minWidth: '70%',
      minHeight: '70%',
      data: {groupId: this.groupId}
    });
  }
}
