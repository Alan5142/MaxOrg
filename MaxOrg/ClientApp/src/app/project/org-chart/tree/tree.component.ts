import {Component, Input, OnInit} from '@angular/core';
import { NewSubgroupComponent } from '../new-subgroup/new-subgroup.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  @Input() treeData: [];
  @Input() parentId: string=null;
  @Input() userId;
  @Input() adminId: string=null;
  isAdmin:boolean=false;
  constructor(public dialog: MatDialog) {
    
  }

  ngOnInit() {
    if (this.adminId!=null){
      if(this.userId==this.adminId)
        this.isAdmin=true;
    }
  }
  openDialog(parentId): void {
    const dialogRef = this.dialog.open(NewSubgroupComponent, {
      width: '50%',
      minWidth: '300px',
      data: {parentId}
    });
  }
}
