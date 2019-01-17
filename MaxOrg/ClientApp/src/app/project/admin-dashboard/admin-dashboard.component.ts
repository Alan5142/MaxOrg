import { Component } from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {

  constructor(public mediaObserver: MediaObserver) {}
}
