import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {Location} from '@angular/common';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';
import {ActivatedRoute, Router} from "@angular/router";
import {merge, Observable, Subject, Subscription} from "rxjs";
import {ChatService} from "../../services/chat.service";
import {map, shareReplay} from "rxjs/operators";
import {ChatModel, Message, MessageType} from "../../services/chat-model";
import {User, UserService} from "../../../services/user.service";
import {FabButton} from "../../../common-components/speed-dial-fab/fab-button.model";
import {MatDialog, MatSnackBar} from "@angular/material";
import {UploadFileComponent} from "./upload-file/upload-file.component";
import {HttpEventType, HttpResponse} from "@angular/common/http";
import {HideNavbarService} from "../../services/hide-navbar.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  MessageType = MessageType;

  @Input() userId: number;
  @ViewChild('scroll') virtualScroll: VirtualScrollerComponent;
  @ViewChild('uploadImage') uploadImage: ElementRef<HTMLElement>;
  @ViewChild('uploadFile') uploadFile: ElementRef<HTMLElement>;


  chat: Observable<ChatModel>;
  receiveMessages: Observable<any>;
  chatId: string;
  currentUser: Observable<User> = null;
  chatMessages: Message[];
  change: Subscription;


  speedDialFabButtons: FabButton[] = [
    new FabButton({
      icon: 'attach_file',
      tooltip: 'Subir un archivo',
      color: 'primary'
    }),
    new FabButton({
      icon: 'add_photo_alternate',
      tooltip: 'Subir una imágen',
      color: 'primary'
    })
  ];

  constructor(public mediaObserver: MediaObserver,
              public location: Location,
              public userService: UserService,
              private route: ActivatedRoute,
              private chatService: ChatService,
              private router: Router,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              private hideNavbar: HideNavbarService) {
    this.currentUser = this.userService.getCurrentUser().pipe(shareReplay(1));
    this.route.queryParamMap
      .subscribe(params => {
        this.chatId = params.get('chatId');
        if (this.chatId === null || this.chatId === '') {
          return;
        }
        this.chat = chatService.getChatWithId(this.chatId).pipe(shareReplay(1)).pipe(map<ChatModel, ChatModel>(model => {
          return model;
        }));
        this.chat.subscribe(c => {
            this.chatMessages = c.messages;
            setTimeout(() => this.virtualScroll.scrollToIndex(c.messages.length - 1, true, 0, 0), 600)
          },
          error => this.router.navigate(['not-found'], {relativeTo: this.route.parent}));
      });
  }

  ngOnInit() {
    this.receiveMessages = this.chatService.observeMessages;
    this.receiveMessages.subscribe(message => {
      this.chatMessages.push(message);
      setTimeout(() =>
        this.virtualScroll.scrollToIndex(this.chatMessages.length - 1, true, 0, 0), 50);
    });
    this.chat = merge(this.chat, this.receiveMessages);
    this.chatService.onConnectedObservable.subscribe(() => {
      this.chatService.connect(this.chatId);
    });
    this.change = this.mediaObserver.asObservable().subscribe(o => {
      this.hideNavbar.setValue(this.mediaObserver.isActive('lt-md'));
    });

  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.chatService.disconnect(this.chatId);
    this.hideNavbar.setValue(false);
    this.change.unsubscribe();
  }

  sendMessage(message: string) {
    if (message.length === 0) {
      return;
    }
    this.chatService.sendMessage(this.chatId, message).subscribe(r => {
    })
  }

  scrollToBottom(index: number) {
    this.virtualScroll.scrollToIndex(index, true, 0, 0);
  }

  onSpeedDialFabClicked(btn: FabButton) {
    if (btn === this.speedDialFabButtons[0]) {
      this.uploadFile.nativeElement.click();
    } else {
      this.uploadImage.nativeElement.click();
    }
  }

  uploadImageToServer($event: any) {
    if ($event.target.files.length !== 1) {
      return;
    }

    const behaviourSubject = new Subject<number | boolean>();
    const dialog = this.dialog.open(UploadFileComponent, {data: behaviourSubject.asObservable()});
    const observable = this.chatService.sendFile(this.chatId, $event.target.files[0]).subscribe(result => {
      if (result.type === HttpEventType.UploadProgress) {
        behaviourSubject.next(Math.round(100 * result.loaded / result.total));
      } else if (result instanceof HttpResponse) {
        behaviourSubject.next(true);
        behaviourSubject.complete();
      }
    }, error => {
      this.snackbar.open('No se pudo subir', 'OK', {duration: 2000});
      dialog.close();
    });
    dialog.afterClosed().subscribe(closed => {
      observable.unsubscribe();
    });
  }
}
