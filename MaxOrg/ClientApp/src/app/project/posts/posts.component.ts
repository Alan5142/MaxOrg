import { Component, OnInit } from '@angular/core';
import {NotificationService} from '../../services/notification.service';


@Component({
  selector: 'app-project-index',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  testNotification() {
  }
}
