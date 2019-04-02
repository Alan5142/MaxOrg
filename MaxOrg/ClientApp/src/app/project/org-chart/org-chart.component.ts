import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from 'src/app/services/projects.service';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']

})
export class OrgChartComponent implements OnInit {

  treeWidth = 80;
  myTree =[];

  constructor(public route:ActivatedRoute, public projectService:ProjectsService) {
    this.route.parent.params.subscribe(params => {
      this.projectService.getProject(params['id']).subscribe(project => {
        this.myTree.push(project);
        console.log(this.myTree);
        this.calcLeafs(this.myTree);
      })
    });
  }

  ngOnInit() {
  
  }

  calcLeafs(tree: any) {

    tree.forEach(node => {
      if (!node.subgroups||node.subgroups==[]) {
        this.treeWidth += (node.name.length > 9) ? node.name.length * 11 + 10 : 75;
      } else {
        this.calcLeafs(node.subnodes);
      }

    });
  }
}
