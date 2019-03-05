import {AfterViewInit, Component, OnInit, ViewChildren} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {MatDialog, MatTab, MatTabGroup} from '@angular/material';
import {AssignWorkComponent} from './assign-work/assign-work.component';

@Component({
  selector: 'app-assigned-work',
  templateUrl: './assigned-work.component.html',
  styleUrls: ['./assigned-work.component.scss']
})
export class AssignedWorkComponent implements OnInit, AfterViewInit {
  @ViewChildren(MatTabGroup) group;
  @ViewChildren(MatTab) tabs;
  tab_num = 0;
  selected = 0;
  SWIPE_ACTION = {LEFT: 'swipeleft', RIGHT: 'swiperight'};

  constructor(public mediaObserver: MediaObserver, public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.tab_num = this.tabs.length;
  }

  swipe(type: any) {
    if (type === this.SWIPE_ACTION.RIGHT && this.selected > 0) {
      console.log('movin left');
      this.selected--;
    } else if (type === this.SWIPE_ACTION.LEFT && this.selected < this.tab_num - 1) {
      console.log('movin right');
      this.selected++;
    }
  }

  openAssignTask() {
    const dialogRef = this.dialog.open(AssignWorkComponent, {
      width: '250px',
      maxWidth: '400px',
      data: null
    });
  }
}
