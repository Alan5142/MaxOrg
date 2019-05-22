import { Component, OnInit } from '@angular/core';
import {GroupsService} from "../../../services/groups.service";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-show-issues',
  templateUrl: './show-issues.component.html',
  styleUrls: ['./show-issues.component.scss']
})
export class ShowIssuesComponent implements OnInit {
  issues: Observable<any[]>;
  groupId: string;

  constructor(private groupService: GroupsService,
              private activatedRoute: ActivatedRoute) {
    this.activatedRoute.parent.params.subscribe(p => {
      this.groupId = p['id'];
    });
  }

  ngOnInit() {
    this.issues = this.groupService.getRepositoryIssues(this.groupId);
  }

}
