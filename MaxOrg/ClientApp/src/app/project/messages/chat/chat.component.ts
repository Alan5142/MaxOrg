import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {Location} from '@angular/common';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';
import {ActivatedRoute, Router} from "@angular/router";
import {merge, Observable} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {shareReplay} from "rxjs/operators";
import {ChatModel} from "../../services/chat-model";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() userId: number;
  @ViewChild('scroll') virtualScroll: VirtualScrollerComponent;


  chat: Observable<ChatModel>;
  receiveMessages: Observable<any>;
  chatId: string;

  public items = Array.from({length: 100}).map((_, i) => `Item #${i}`);

  constructor(public mediaObserver: MediaObserver,
              public location: Location,
              public userService: UserService,
              private route: ActivatedRoute,
              private chatService: ChatService,
              private router: Router) {
    this.route.queryParamMap
      .subscribe(params => {
        this.chatId = params.get('chatId');
        if (this.chatId === null || this.chatId === '') {
          return;
        }
        this.chat = chatService.getChatWithId(this.chatId).pipe(shareReplay(1));
        this.userService.getCurrentUser().subscribe(u => console.log(u));
        this.chat.subscribe(c => this.virtualScroll.scrollToIndex(this.items.length - 1, true, 0, 0),
            error => this.router.navigate(['not-found'], {relativeTo: this.route.parent}));
      });
  }

  updateMessages() {
    const newMessages = this.chatService.getChatWithId(this.chatId).pipe(shareReplay(1));
    this.chat = merge(this.chat, newMessages);
  }

  ngOnInit() {
    this.chatService.onConnectedObservable.subscribe(() => {
      this.chatService.connect(this.chatId);
      this.receiveMessages = this.chatService.observeMessages;
      this.receiveMessages.subscribe(messageReceived => {
        this.updateMessages();
      });
    });

  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.chatService.disconnect(this.chatId);
  }

  sendMessage(message: string) {
    this.chatService.sendMessage(this.chatId, message).subscribe(r => {
      this.updateMessages();
    })
  }
}
