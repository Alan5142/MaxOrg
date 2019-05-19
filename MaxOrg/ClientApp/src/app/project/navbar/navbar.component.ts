import {ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {GroupInfo, GroupsService} from "../../services/groups.service";
import {Observable} from "rxjs";
import {User, UserService} from "../../services/user.service";
import {shareReplay} from "rxjs/operators";
import {MediaObserver} from "@angular/flex-layout";
import {HideNavbarService} from "../services/hide-navbar.service";

@Component({
  selector: 'app-project-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {
  notifications: number[];
  user: Observable<User>;
  projectInfo: Observable<GroupInfo>;

  constructor(changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              private route: ActivatedRoute,
              private groupsService: GroupsService,
              private router: ActivatedRoute,
              private userService: UserService,
              private navRouter: Router,
              public mediaObserver: MediaObserver,
              public hideNavbar: HideNavbarService) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/github.svg'));
    iconRegistry.addSvgIcon(
      'flask',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/flask.svg'));
    this.notifications = Array(10).fill(4);
    this.user = userService.getCurrentUser();

    this.router.paramMap.subscribe(params => {
      this.projectInfo = this.groupsService.getGroupInfo(params.get('id')).pipe(shareReplay(1));
      this.projectInfo.subscribe(() => {}, error => {
        this.navRouter.navigate(['/start-page/not-found']);
      })
    });
  }


  ngOnInit() {
  }
}
