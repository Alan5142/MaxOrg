import {Component, OnInit, OnChanges} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from 'src/app/services/projects.service';

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
  constructor(public route:ActivatedRoute, public projectService:ProjectsService) {
    this.userId=localStorage.getItem('userId');
    this.route.parent.params.subscribe(params => {
      this.observable = this.projectService.getProject(params['id']);
      this.observable.subscribe(project => {
        console.log(project);
        this.myTree.push(project);
        this.calcLeafs(this.myTree);
      })
    });
  }

  ngOnInit() {
  }

  calcLeafs(tree: any) {
    if (tree === undefined) {
      return;
    }
    tree.forEach(node => {
      console.log(node.subgroups);
      if (!node.subgroups||node.subgroups==[]) {
        this.treeWidth += (node.name.length > 9) ? node.name.length * 11 + 10 : 75;
      } else {
        this.calcLeafs(node.subgroups);
      }

    });
  }
  ngOnChanges(): void {
  }
}
