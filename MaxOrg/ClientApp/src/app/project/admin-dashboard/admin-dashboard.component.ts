import {Component, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {MatDialog, MatSlideToggleChange, MatSnackBar} from '@angular/material';
import {ChangeDescriptionComponent} from './change-description/change-description.component';
import {ActivatedRoute} from '@angular/router';
import {LinkToGithubComponent} from "./link-to-github/link-to-github.component";
import {UserService} from "../../services/user.service";
import {FormBuilder} from "@angular/forms";
import {GroupsService} from "../../services/groups.service";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/operators";
import {TestsService} from "../../services/tests.service";
import {ProjectsService, Requirement, RequirementType} from 'src/app/services/projects.service';
import {Task, TasksService} from 'src/app/services/tasks.service';
import {ChartDataSets, ChartOptions} from "chart.js";
import {BaseChartDirective, Color, Label} from "ng2-charts";
import {ReadOnlyService} from "../services/read-only.service";
import {NewDerivedProjectComponent} from "./new-derived-project/new-derived-project.component";
import {AddMembersComponent} from "./add-members/add-members.component";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {

  @ViewChild(BaseChartDirective)
  public chart: BaseChartDirective;

  public lineChartData: ChartDataSets[] = [
    {data: [], label: '# tareas'}
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      xAxes: [{}],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        }
      ]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // green
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgb(75,177,64)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = false;
  public lineChartType = 'line';


  groupId: string;
  percent_ratio = {
    tasks: false,
    functionalRequirements: false,
    nonFunctionalRequirements: false
  };

  groupInfo: Observable<any>;

  constructor(public mediaObserver: MediaObserver,
              public dialog: MatDialog,
              public route: ActivatedRoute,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private formBuilder: FormBuilder,
              private groupService: GroupsService,
              private testsService: TestsService,
              private projectService: ProjectsService,
              private taskService: TasksService,
              public readOnlyService: ReadOnlyService) {
    route.parent.params.subscribe(params => {
      this.groupId = params['id'];
      this.groupInfo = groupService.getAdminInfo(this.groupId).pipe(shareReplay(1));
    });
  }

  tasksInfo = {
    finished: 0,
    halfProgress: 0,
    noProgress: 0,
    total: 0
  };

  getTasksInfo(groups) {
    groups.forEach(group => {
      this.taskService.getGroupTasks(group.id).subscribe((tasks: []) => {
        tasks.forEach((task: Task) => {
          if (task.progress == 100)
            this.tasksInfo.finished++;
          else if (task.progress > 0)
            this.tasksInfo.halfProgress++;
          else
            this.tasksInfo.noProgress++;
          this.tasksInfo.total++;
        });
      });
      this.getTasksInfo(group.subgroups);
    });
  }

  reqsInfo = {
    fReqTotal: 0,
    fReqFinished: 0,
    nfReqTotal: 0,
    nfReqFinished: 0
  };

  getReqsInfo() {
    this.projectService.getProjectRequirements(this.groupId).subscribe((reqs: Requirement[]) => {
      reqs.filter(req => req.requirementType == RequirementType.Functional).forEach(req => {
        this.projectService.getRequirementProgress(this.groupId, req.id).subscribe((progress: number) => {
          if (progress >= 100)
            this.reqsInfo.fReqFinished++;
          this.reqsInfo.fReqTotal++;
        });
      });
      reqs.filter(req => req.requirementType == RequirementType.NonFunctional).forEach(req => {
        this.projectService.getRequirementProgress(this.groupId, req.id).subscribe((progress: number) => {
          if (progress >= 100)
            this.reqsInfo.nfReqFinished++;
          this.reqsInfo.nfReqTotal++;
        });
      });
    });
  }

  getTaskStats(groups) {
    groups.forEach(group => {
      this.taskService.getTasksStats(group.id).subscribe((dates: []) => {
        dates.forEach((date: any) => {
          const num = date.tasks;
          const asDate = new Date(date.date);
          const stringFormat = `${asDate.getDate()}/${asDate.getMonth() + 1}/${asDate.getFullYear()}`;
          const indexOfDay = this.lineChartLabels.indexOf(stringFormat);
          const data = this.lineChartData[0].data as number[];
          if (indexOfDay === -1) {
            data.push(num);
            this.lineChartLabels.push(stringFormat);
          } else {
            data[indexOfDay] += num;
          }
        });
        this.chart.update()
      });
      this.getTaskStats(group.subgroups);
      setTimeout(() => this.chart.update(), 100);
    });
  }

  ngOnInit() {
    this.projectService.getProject(this.groupId).subscribe(project => {
      let groups = [];
      groups.push(project);
      this.getTasksInfo(groups);
      this.getTaskStats(groups);
    });
    this.getReqsInfo();
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
        dialogRef.afterClosed().subscribe(r => {
          if (r === null || r === undefined) {
            return;
          }
          this.groupService.linkToGitHub(this.groupId, r.id).subscribe(() => {
            this.snackBar.open('Vinculado con exito', 'OK', {duration: 2000});
          }, err => {
            this.snackBar.open('No fue posible vincularlo', 'OK', {duration: 2000});
          })
        })
      },
      error => {
        this.snackBar.open('No se pudieron listar los repositorios, verifica que tu cuenta este vinculada a GitHub', 'OK');
      });
  }

  editInfo(checked: boolean, name: string) {
    if (name.trim() === '') {
      this.snackBar.open('Nombre no puede estar vacio o contener solo espacios', 'OK', {duration: 2000});
      return;
    }

    this.groupService.changeGroupInfo(this.groupId, {
      name: name,
      readOnly: checked
    }).subscribe(() => {
      this.snackBar.open('Información editada con éxito', 'OK', {duration: 2000});
    }, error => {
      this.snackBar.open('No se pudo editar la información', 'OK', {duration: 2000});
    });
  }

  openVSDevOpsAuth() {
    const devops = environment.vsDevOps;
    window.location.href = `${devops.authUrl}?client_id=${devops.clientId}&response_type=Assertion&state=${this.groupId}&scope=${devops.scope}&redirect_uri=${devops.redirect}`;
  }

  changeDevOpsInfo(org: string, projectName: string) {
    this.testsService.updateDevOpsInfo(this.groupId, org, projectName).subscribe(() => {
      this.snackBar.open('Información editada con éxito', 'OK', {duration: 2000});
    }, () => {
      this.snackBar.open('No se pudo editar la información', 'OK', {duration: 2000});
    });
  }

  setReadOnly($event: MatSlideToggleChange) {
    const result = confirm(`¿Seguro que quieres ${$event.source.checked ? 'establecer el modo de solo lectura' : 'volver a activar el proyecto'}?`);
    if (result) {
      this.projectService.setReadOnly(this.groupId).subscribe(() => {
        this.readOnlyService.setValue($event.source.checked);
      }, () => {
        $event.source.checked = !$event.source.checked;
      })
    } else {
      $event.source.checked = !$event.source.checked;
    }
  }

  createDerivedProject(): void {
    const dialogRef = this.dialog.open(NewDerivedProjectComponent, {
      width: '50%',
      minWidth: '300px',
      data: {projectId: this.groupId}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const observable = result as Observable<boolean>;
        observable.subscribe(success => {
          this.snackBar.open('Creado con exito', 'Ok', {duration: 2500});
        }, error => {
          this.snackBar.open('No se pudo crear :(', 'Ok', {duration: 2500});
        });
      }
    });
  }

  addMembers() {
    const dialogRef = this.dialog.open(AddMembersComponent, {
      width: '50%',
      minWidth: '300px',
      data: {groupId: this.groupId}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const observable = result as Observable<boolean>;
        observable.subscribe(success => {
          this.snackBar.open('Agregados con exito', 'Ok', {duration: 2500});
        }, error => {
          this.snackBar.open('No se pudieron agregar :(', 'Ok', {duration: 2500});
        });
      }
    });
  }
}
