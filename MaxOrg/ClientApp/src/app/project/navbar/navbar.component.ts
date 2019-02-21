import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChildren} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {ActivatedRoute} from '@angular/router';
import {MatIconRegistry, MatSidenav} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-project-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  notifications: number[];

  mobileQuery: MediaQueryList;

  private readonly _mobileQueryListener: () => void;

  route: ActivatedRoute;

  @ViewChildren(MatSidenav) sidenav: MatSidenav;

  SWIPE_ACTION = {LEFT: 'swipeleft', RIGHT: 'swiperight'};

  constructor(changeDetectorRef: ChangeDetectorRef,
              media: MediaMatcher,
              route: ActivatedRoute,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer) {
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

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
