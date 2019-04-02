import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GroupCardComponent } from '../../group-card/group-card.component';


@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss']
})
export class NodeComponent implements OnInit {
  @Input() nodeData;
  @Input() userId;
  isMember:boolean=false;
  constructor(public dialog: MatDialog) {
    
   }
  
   openDialog(group): void {
    const dialogRef = this.dialog.open(GroupCardComponent, {
      width: '50%',
      minWidth: '300px',
      data: {group}
    });
  }
  ngOnInit() {
    this.nodeData.members.forEach(member => {
      if(member.key==this.userId){
        this.isMember=true;
      }      
    });
  }

}
