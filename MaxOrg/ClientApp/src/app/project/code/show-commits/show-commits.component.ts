import { Component, OnInit } from '@angular/core';
import {GroupsService} from "../../../services/groups.service";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-show-commits',
  templateUrl: './show-commits.component.html',
  styleUrls: ['./show-commits.component.scss']
})
export class ShowCommitsComponent implements OnInit {
  groupId: string;
  commits: Observable<any[]>;

  constructor(private groupService: GroupsService,
              private activatedRoute: ActivatedRoute) {
    this.activatedRoute.parent.params.subscribe(p => {
      this.groupId = p['id'];
    });
  }

  ngOnInit() {
    this.commits = this.groupService.getRepositoryCommits(this.groupId);
  }

}
