import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  @Input() treeData: [];
  @Input() parentId: string=null;
  @Input() userId;
  isAdmin:boolean=false;
  constructor() {
    
  }

  ngOnInit() {
    if (this.parentId!=null){
      if(this.userId==this.parentId)
        this.isAdmin=true;
    }

  }
}
