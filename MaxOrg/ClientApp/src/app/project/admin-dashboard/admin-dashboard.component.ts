import { Component } from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
  pieChartData =  {
    chartType: 'LineChart',
    dataTable: [
      ['Intervalo', 'Tareas'],
      ['24/12/2018-30/12/2018',  6],
      ['31/12/2018-06/01/2019',  8],
      ['07/01/2019-14/01/2019',  3],
      ['15/01/2019-hoy',  5]

    ],
    options: {explorer: {axis: 'horizontal', keepInBounds: true}},
  };
  constructor(public mediaObserver: MediaObserver) {}
}
