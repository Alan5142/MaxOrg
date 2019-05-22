import {Component, OnChanges, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectsService} from 'src/app/services/projects.service';
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']

})
export class OrgChartComponent implements OnInit,OnChanges {


  treeWidth = 100;
  myTree =[];
  userId;
  observable;
  constructor(public route:ActivatedRoute,
              public projectService:ProjectsService,
              public userService: UserService) {
    this.userService.getCurrentUser().subscribe(u => {
      this.userId = u.key;
    });
    this.userId=localStorage.getItem('userId');
    this.route.parent.params.subscribe(params => {
      this.observable = this.projectService.getProject(params['id']);
      this.observable.subscribe(project => {
        this.myTree.push(project);
        this.calcLeafs(this.myTree);
        this.treeWidth*=2;
      })
    });
  }

  ngOnInit() {
  }

  calcLeafs(tree: any) {
    tree.forEach(node => {
      if (!node.subgroups || node.subgroups===[] || node.subgroups.length === 0) {
        this.treeWidth += (node.name.length > 9) ? node.name.length * 11  : 70;
      } else {
        this.calcLeafs(node.subgroups);
      }

    });
  }
  ngOnChanges(): void {
  }
}
@Component({
  template:""
})
export class reloadChart{
  constructor(router:Router,route:ActivatedRoute){
    router.navigate(["../org-chart"],{relativeTo:route});
  }
}
