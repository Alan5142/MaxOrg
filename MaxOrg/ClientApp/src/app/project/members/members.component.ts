import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {

  displayedColumns: string[] = ['name', 'addedSince'];

  members = [
    {name: 'Alan', addedSince: new Date(), isAdmin: false},
    {name: 'Manuel', addedSince: new Date(), isAdmin: false},
    {name: 'Dummy', addedSince: new Date(), isAdmin: true}
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
