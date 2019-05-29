import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconRegistry, MatSnackBar} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {GroupInfo, GroupsService} from "../../services/groups.service";
import {Observable} from "rxjs";
import {User, UserService} from "../../services/user.service";
import {shareReplay} from "rxjs/operators";
import {MediaObserver} from "@angular/flex-layout";
import {HideNavbarService} from "../services/hide-navbar.service";
import {ReadOnlyService} from "../services/read-only.service";
import {HubConnection, HubConnectionBuilder, LogLevel} from "@aspnet/signalr";

@Component({
  selector: 'app-project-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit, OnDestroy {
  notifications: number[];
  user: Observable<User>;
  projectInfo: Observable<GroupInfo>;
  hubConnection: HubConnection;
  projectId: string;

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
              public hideNavbar: HideNavbarService,
              private snackbar: MatSnackBar,
              public readOnly: ReadOnlyService) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('/project-read-only', {accessTokenFactory: () => userService.userToken, logger: LogLevel.None})
      .build();

    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/github.svg'));
    iconRegistry.addSvgIcon(
      'flask',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/flask.svg'));
    this.notifications = Array(10).fill(4);
    this.user = userService.getCurrentUser();

    this.router.paramMap.subscribe(params => {
      this.projectId = params.get('id');
      this.projectInfo = this.groupsService.getGroupInfo(params.get('id')).pipe(shareReplay(1));
      this.projectInfo.subscribe((projectInfo) => {
        this.readOnly.setValue(projectInfo.finished);
      }, error => {
        this.navRouter.navigate(['/start-page/not-found']);
      })
    });
  }


  ngOnInit() {
    this.hubConnection.start().then(() => {
      this.hubConnection.send('JoinGroup', this.projectId);
      this.hubConnection.on('SetReadOnlyValue', (value: boolean) => {
        this.snackbar.open(`${value ? 'Se archivo el proyecto' : 'Se habilito el proyecto'}`, 'Ok', {duration: 2000});
        this.readOnly.setValue(value);
      });
    });
  }

  ngOnDestroy(): void {
    this.hubConnection.stop();
  }
}
