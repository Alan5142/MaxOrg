import {Component, OnInit, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {GroupCardComponent} from '../group-card/group-card.component';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  @Input() treeData = [];
  @Input() admin: boolean;
  user: any = {admin: 'true', memberOf: 'trabajo'};

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  openDialog(group): void {
    const dialogRef = this.dialog.open(GroupCardComponent, {
      width: '50%',
      minWidth: '300px',
      data: {name: group}
    });
  }
}
