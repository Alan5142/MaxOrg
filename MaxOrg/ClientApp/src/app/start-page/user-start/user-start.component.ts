import {Component, OnInit} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewProjectComponent} from '../new-project/new-project.component';
import {MediaObserver} from '@angular/flex-layout';
import {Notification as UserNotification, User, UserService} from '../../services/user.service';
import {Project, ProjectsService} from '../../services/projects.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {map, shareReplay} from 'rxjs/operators';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-user-start',
  templateUrl: './user-start.component.html',
  styleUrls: ['./user-start.component.scss']
})
export class UserStartComponent implements OnInit {
  user: Observable<User>;
  projectsView: Observable<Project[]>;
  projects: Observable<Project[]>;
  notifications: Observable<UserNotification[]> = null;

  constructor(public dialog: MatDialog,
              public mediaObserver: MediaObserver,
              public userService: UserService,
              private projectsService: ProjectsService,
              private router: Router,
              private snackBar: MatSnackBar,
              private notificationService: NotificationService) {
    this.notifications = this.userService.getUserNotifications().pipe(shareReplay(1));
    notificationService.connect();
    this.user = this.userService.getCurrentUser();
    this.projects = this.projectsService.getProjects().pipe(shareReplay(1));
    this.projectsView = this.projects;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NewProjectComponent, {
      width: '50%',
      minWidth: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const observable = result as Observable<boolean>;
        observable.subscribe(success => {
          this.projects = this.projectsService.getProjects();
          this.projectsView = this.projects;
          this.snackBar.open('Creado con exito', 'Ok', {duration: 2500});
        }, error => {
          this.snackBar.open('No se pudo crear :(', 'Ok', {duration: 2500});
        });
      }
    });
  }

  ngOnInit() {
  }

  goToProject(id: string) {
    this.router.navigate(['/project/', id]);
  }

  searchContent(content: string) {
    this.projectsView = this.projects.pipe(map<Project[], Project[]>(projects => {
      return projects.filter((value, index, array) => {
        return value.name.toLowerCase().includes(content.toLowerCase());
      });
    }));
  }
}
