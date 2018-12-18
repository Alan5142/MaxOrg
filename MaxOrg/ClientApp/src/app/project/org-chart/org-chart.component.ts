import { Component, OnInit} from '@angular/core';
import {TreeComponent} from './tree/tree.component';

@Component({
  selector: 'app-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss']
  
})
export class OrgChartComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
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
  
}
