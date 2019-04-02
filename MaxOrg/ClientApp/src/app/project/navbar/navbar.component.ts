import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChildren} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {ActivatedRoute} from '@angular/router';
import {MatIconRegistry, MatSidenav} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import { Project, ProjectsService } from 'src/app/services/projects.service';

@Component({
  selector: 'app-project-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  notifications: number[];
  project:Project;
  projectName:string='';
  mobileQuery: MediaQueryList;
  route: ActivatedRoute;
  @ViewChildren(MatSidenav) sidenav: MatSidenav;
  SWIPE_ACTION = {LEFT: 'swipeleft', RIGHT: 'swiperight'};
  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              route: ActivatedRoute,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              public projectService:ProjectsService) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/github.svg'));
    iconRegistry.addSvgIcon(
      'flask',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/flask.svg'));
    this.route = route;
    this.notifications = Array(10).fill(4);
    this.mobileQuery = media.matchMedia('(max-width: 960px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.route.parent.params.subscribe(params => {
      this.projectService.getProject(params['id']).subscribe(project => {
        this.projectName=project.name;
      })
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
