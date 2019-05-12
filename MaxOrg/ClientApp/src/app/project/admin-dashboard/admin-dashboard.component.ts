import {Component, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {GoogleChartComponent} from 'ng2-google-charts';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ChangeDescriptionComponent} from './change-description/change-description.component';
import {ActivatedRoute} from '@angular/router';
import {LinkToGithubComponent} from "./link-to-github/link-to-github.component";
import {UserService} from "../../services/user.service";

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
              public route: ActivatedRoute,
              private userService: UserService,
              private snackBar: MatSnackBar) {
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

  openLinkToGitHubDialog() {
    this.userService.userRepos.subscribe(repos => {
        const dialogRef = this.dialog.open(LinkToGithubComponent, {
          data: repos,
          maxHeight: '500px',
          maxWidth: '400px'
        });
      },
      error => {
        this.snackBar.open('No se pudieron listar los repositorios, verifica que tu cuenta este vinculada a GitHub', 'OK');
      });
  }
}
