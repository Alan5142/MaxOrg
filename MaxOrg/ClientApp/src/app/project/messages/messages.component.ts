import {Component, OnInit} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  chatId: string = null;

  constructor(private route: ActivatedRoute, public mediaObserver: MediaObserver) {
    this.chatId = null;
    this.route.queryParamMap
      .subscribe(params => {
        this.chatId = params.get('chatId');
      });
  }

  ngOnInit() {
  }

}
