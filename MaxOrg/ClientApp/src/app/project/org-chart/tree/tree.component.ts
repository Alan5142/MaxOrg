import {Component, Input, OnInit} from '@angular/core';
import { NewSubgroupComponent } from '../new-subgroup/new-subgroup.component';
import { MatDialog, MatSnackBar } from '@angular/material';

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
  @Input() isAdmin:boolean=false;
  constructor(public dialog: MatDialog, public snackBar:MatSnackBar) {
    
  }

  ngOnInit() {
    if(this.isAdmin)
      return;
    if(this.userId==this.adminId)
      this.isAdmin=true;
  }
  openDialog(parentId): void {
    const dialogRef = this.dialog.open(NewSubgroupComponent, {
      width: '50%',
      minWidth: '300px',
      data: {parentId}
    });
    dialogRef.afterClosed().subscribe(r=>{
      if(r)
      this.snackBar.open("grupo creado","OK");
      
    },error=>{this.snackBar.open("no se pudo crear :(", "OK")});
  }
}
