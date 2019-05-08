import {AfterViewInit, Component, OnInit, ViewChildren} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {MatDialog, MatTab, MatTabGroup} from '@angular/material';
import {AssignWorkComponent} from './assign-work/assign-work.component';
import { ProjectsService } from 'src/app/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { TasksService, Task } from 'src/app/services/tasks.service';

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
  groups;
  adminGroups=[];
  adminGroupsFlat=[];
  object={};
  userId;
  
  constructor(public mediaObserver: MediaObserver, public dialog: MatDialog, public route:ActivatedRoute, public projectService:ProjectsService, private taskService:TasksService) {
    this.userId=localStorage.getItem('userId');
    this.route.parent.params.subscribe(params => {
      this.projectService.getProject(params['id']).subscribe(project => {
        this.groups=project;
        if(this.groups.groupOwner==this.userId)
          this.adminGroups=this.groups.subgroups;
        else
          this.groups.subgroups.forEach(group => {
            this.getAdminGroups(group);
          });
        this.flat(this.adminGroups);
        console.log(this.adminGroupsFlat);
      })
    });
    
  }
  getAdminGroups(group){
    if(group.groupOwner==this.userId){
      this.adminGroups.push(group);
    }
    else{
      group.subgroups.forEach(group => {
        this.getAdminGroups(group);
      });
    }
  }
  flat(toFlat){
    toFlat.forEach(group => {
      this.adminGroupsFlat.push({
        name:group.name,
        id:group.id,
        members:group.members,
        tasks: this.taskService.getGroupTasks(group.id)
      });
      this.flat(group.subgroups);
    });
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

  openAssignTask(groupId:string) {
    const dialogRef = this.dialog.open(AssignWorkComponent, {
      width: '250px',
      maxWidth: '400px',
      data: groupId
    });
  }
}
