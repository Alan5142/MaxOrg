import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {NewProjectComponent} from '../new-project/new-project.component';
import {MediaObserver} from '@angular/flex-layout';
import {User, UserService} from '../../services/user.service';
import {Project, ProjectsService} from '../../services/projects.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-user-start',
  templateUrl: './user-start.component.html',
  styleUrls: ['./user-start.component.scss']
})
export class UserStartComponent implements OnInit {
  currentUser: User | null = null;
  projectsView: Observable<Project[]>;
  projects: Observable<Project[]>;

  constructor(public dialog: MatDialog,
              public mediaObserver: MediaObserver,
              public userService: UserService,
              private projectsService: ProjectsService,
              private router: Router) {
    userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.projects = this.projectsService.getProjects();
      this.projectsView = this.projects;
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(NewProjectComponent, {
      width: '50%',
      minWidth: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.projects = this.projectsService.getProjects();
      this.projectsView = this.projects;
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
