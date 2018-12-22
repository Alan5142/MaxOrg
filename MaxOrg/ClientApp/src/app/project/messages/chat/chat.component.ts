import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../../services/user.service';
import {MediaObserver} from '@angular/flex-layout';
import {Location} from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @Input() userId: number;

  constructor(public mediaObserver: MediaObserver, public location: Location) {
  }

  ngOnInit() {
  }
}
