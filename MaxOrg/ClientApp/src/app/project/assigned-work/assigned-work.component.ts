import { AfterViewInit, Component, OnInit, ViewChildren, ViewChild } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { MatDialog, MatTab, MatTabGroup, MatSnackBar, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { AssignWorkComponent } from './assign-work/assign-work.component';
import { ProjectsService } from 'src/app/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { TasksService, Task } from 'src/app/services/tasks.service';
import { map } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { EditTaskComponent } from './edit-task/edit-task.component';

@Component({
  selector: 'app-assigned-work',
  templateUrl: './assigned-work.component.html',
  styleUrls: ['./assigned-work.component.scss']
})

export class AssignedWorkComponent implements OnInit, AfterViewInit {
  @ViewChildren(MatTabGroup) group;
  @ViewChildren(MatTab) tabs;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['username', 'actions'];
  usersDisplay: MatTableDataSource<any>;
  tab_num = 0;
  selected = 0;
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  groups=[]; groupsFlat=[];
  adminGroups = [];  adminGroupsFlat = [];
  membergroups=[];
  userId;
  taskTarget;
  projectId;
  users = [];
  admin=true;
  constructor(public snackBar: MatSnackBar, public mediaObserver: MediaObserver, public dialog: MatDialog,
    public route: ActivatedRoute, public projectService: ProjectsService, private taskService: TasksService) {
    this.userId = localStorage.getItem('userId');
    this.taskTarget = localStorage.getItem("taskTarget");
    this.route.parent.params.subscribe(params => {
      this.projectId = params['id'];
      this.projectService.getProject(params['id']).subscribe(project => {
        this.groups.push(project);
        if(this.groups[0].groupOwner==this.userId){
          this.users=this.groups[0].members;}
        this.groups[0].subgroups.forEach(group => {
          this.getAdminGroups(group);
        });
        this.flat(this.adminGroups,this.adminGroupsFlat);
        this.getMembers(this.adminGroupsFlat);
        if(this.users.length==0)
          this.admin=false;
        this.usersDisplay = new MatTableDataSource(this.users);
        this.flat(this.groups,this.groupsFlat);
        this.getMemberGroups(this.groupsFlat);
        console.log(this.taskService.getGroupTasks(this.projectId).subscribe(r=>console.log(r)));
        console.log(this.membergroups);
        console.log(this.adminGroupsFlat);
        console.log(this.users);
        this.usersDisplay.sort = this.sort;
        this.usersDisplay.paginator = this.paginator;
      })
    });

  }
  ngOnInit() {
    
  }
  getMemberGroups(groups){
    groups.forEach(group => {
      group.members.forEach(member => {
        if(member.key==this.userId)
          this.membergroups.push({
            name: group.name,
            id: group.id,
            members: group.members,
            tasks: this.taskService.getGroupTasks(group.id)
          });
      });
    });
  }
  getAdminGroups(group) {
    if (group.groupOwner == this.userId) {
      this.adminGroups.push(group);
    }
    else {
      group.subgroups.forEach(group => {
        this.getAdminGroups(group);
      });
    }
  }
  getMembers(groupArray){
    groupArray.forEach(group => {
      group.members.forEach(member => {
        let repeat = false;
        this.users.forEach(user => {
          if (user.key == member.key)
            repeat = true;
        });
        if (!repeat){
          this.users.push(member);
          if(member.key==this.taskTarget)
            this.openAssignTask(this.taskTarget,true);  
        }
      });
    });
  }
  flat(toFlat,flatArray) {
    toFlat.forEach((group) => {
      flatArray.push({
        name: group.name,
        id: group.id,
        members: group.members,
        tasks: this.taskService.getGroupTasks(group.id)
      });
      this.flat(group.subgroups,flatArray);
      if (this.taskTarget == group.id)
        this.openAssignTask(this.taskTarget,false, this.adminGroupsFlat.length - 1);
    });
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

  openAssignTask(id: string, isUser:boolean, index?: number) {
    localStorage.setItem("projectId", this.projectId);
    console.log(this.projectId);
    const dialogRef = this.dialog.open(AssignWorkComponent, {
      width: '50%',
      maxWidth: '500px',
      minWidth: '250px',
      data: {id:id,isUser:isUser}
    });
    dialogRef.afterClosed().subscribe(r => {
      if (r) {
        r.subscribe(r=>console.log(r));
        if(!isUser)
          r.subscribe(r=>{
            console.log(r);
          this.adminGroupsFlat[index].tasks =
          this.adminGroupsFlat[index].tasks.pipe(map<Task[], any>(tasks => { return tasks; }))});
        this.snackBar.open("Tarea agregada", "cerrar");
      }
    },error=>this.snackBar.open("La tarea no se pudo agregar","cerrar"));
  }
  applyFilter(filterValue: string) {
    this.usersDisplay.filter = filterValue.trim().toLowerCase();
    if (this.usersDisplay.paginator) {
      this.usersDisplay.paginator.firstPage();
    }
  }
  openEditTask(task,groupId){
    console.log(task);
    const dialogRef=this.dialog.open(EditTaskComponent,{
      data:{task:task,groupId:groupId},
      width:"350px"
    });
    dialogRef.afterClosed().subscribe(progress=>{
      if(progress){
        task.progress=progress;
        this.snackBar.open("progreso añadido","cerrar");
      }
    },error=>this.snackBar.open("no se pudo añadir progreso","cerrar"));
  }
}
