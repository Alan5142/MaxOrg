import { Component, OnInit} from '@angular/core';
import {TreeComponent} from './tree/tree.component';
import { unsupported } from '@angular/compiler/src/render3/view/util';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
  
})
export class OrgChartComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.calcLeafs(this.myTree);
  }
  treeWidth=75;
  myTree =     [
    {name:"MaxOrg",subnodes:[
                {name:"Inicio",subnodes:[
                  {name:"Mi perfil"},
                  {name:"Mis pendientes"},
                  {name:"Mis notificaciones"},
                  {name:"Mis proyectos"}
                ]
                },
                {name:"proyecto",subnodes:[
                  {name:"trabajo"},
                  {name:"codigo"},
                  {name:"test"}
                ]}
             ]
    }
];
calcLeafs(tree:any) {
    
  tree.forEach(node => {
    if(!node.subnodes){
      this.treeWidth+=(node.name.length>9)?node.name.length*11+10:75
    }
    else{
      this.calcLeafs(node.subnodes);
    }
    
  });
}
}
