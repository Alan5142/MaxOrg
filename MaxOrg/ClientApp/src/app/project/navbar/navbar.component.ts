import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChildren} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconRegistry, MatSidenav} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {GroupInfo, GroupsService} from "../../services/groups.service";
import {Observable} from "rxjs";
import {User, UserService} from "../../services/user.service";
import {shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-project-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  notifications: number[];
  user: Observable<User>;
  projectInfo: Observable<GroupInfo>;


  mobileQuery: MediaQueryList;
  route: ActivatedRoute;
  @ViewChildren(MatSidenav) sidenav: MatSidenav;
  SWIPE_ACTION = {LEFT: 'swipeleft', RIGHT: 'swiperight'};
  _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              route: ActivatedRoute,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              private groupsService: GroupsService,
              private router: ActivatedRoute,
              private userService: UserService) {
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

    this.user = userService.getCurrentUser();

    this.router.paramMap.subscribe(params => {
      this.projectInfo = this.groupsService.getGroupInfo(params.get('id')).pipe(shareReplay(1));
      this.projectInfo.subscribe(result => console.log(result));
    });
  }


  ngOnInit() {
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
