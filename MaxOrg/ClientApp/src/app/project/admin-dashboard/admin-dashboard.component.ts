import {Component, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {ChartSelectEvent, GoogleChartComponent} from 'ng2-google-charts';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  @ViewChild('tasksChart') tasksChart: GoogleChartComponent;

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

  constructor(public mediaObserver: MediaObserver) {
  }

  ngOnInit() {
  }
}
