import {Component, OnInit} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {ActivatedRoute} from '@angular/router';
import {Observable} from "rxjs";
import {GetUserChatsResponse} from "../services/chat-model";
import {ChatService} from "../services/chat.service";
import {shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  chatId: string = null;
  chats: Observable<GetUserChatsResponse>;

  constructor(private route: ActivatedRoute,
              public mediaObserver: MediaObserver,
              private chatService: ChatService) {
    this.chatId = null;
    this.route.queryParamMap
      .subscribe(params => {
        this.chatId = params.get('chatId');
      });
    this.route.parent.params.subscribe(params => {
      this.chats = chatService.userChats(params['id']).pipe(shareReplay(1));
      this.chats.subscribe(r => console.log(r));
    })
  }

  ngOnInit() {
  }

}
