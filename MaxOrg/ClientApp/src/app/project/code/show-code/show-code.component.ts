import { Component, OnInit } from '@angular/core';
import {MatIconRegistry} from "@angular/material";
import {DomSanitizer} from "@angular/platform-browser";
import {MediaObserver} from "@angular/flex-layout";
import {Observable} from "rxjs";
import {GroupsService} from "../../../services/groups.service";
import {ActivatedRoute} from "@angular/router";
import {shareReplay} from "rxjs/operators";
import {merge} from 'rxjs';

@Component({
  selector: 'app-show-code',
  templateUrl: './show-code.component.html',
  styleUrls: ['./show-code.component.scss']
})
export class ShowCodeComponent implements OnInit {

  code: Observable<any[]>;

  groupId: string;
  path: string = '/';

  constructor(iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              public mediaObserver: MediaObserver,
              private groupService: GroupsService,
              private activatedRoute: ActivatedRoute) {
    this.activatedRoute.parent.params.subscribe(p => {
      this.groupId = p['id'];
    });
    iconRegistry.addSvgIcon(
      'file',
      sanitizer.bypassSecurityTrustResourceUrl('/icons/file_icon.svg'));
  }

  ngOnInit() {
    this.code = this.groupService.getRepositoryCode(this.groupId, this.path).pipe(shareReplay(1));
  }

  setDir(path: string) {
    this.path = path;
    this.code = this.groupService.getRepositoryCode(this.groupId, this.path).pipe(shareReplay(1));
  }

  dirUp() {
    this.path = this.path.substr(0, this.path.lastIndexOf('/'));
    this.setDir(this.path);
  }
}
