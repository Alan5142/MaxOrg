import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {UserService} from "../../../../services/user.service";
import {Message, MessageType} from "../../../services/chat-model";
import {Observable} from "rxjs";
import {ChatService} from "../../../services/chat.service";
import {shareReplay} from "rxjs/operators";

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit, AfterViewInit {
  MessageType = MessageType;

  @Input() sender: string;
  @Input() message: string;
  @Input() selfMessage: boolean = true;
  @Input() messageData: Message;
  @Input() lastMessage: boolean;
  @Output() refresh = new EventEmitter<void>();

  attachmentData: Observable<any> = null;

  private videoElement: ElementRef<HTMLElement>;

  @ViewChild('videoElement') set content(content: ElementRef<HTMLElement>) {
    this.videoElement = content;
  }

  constructor(private userService: UserService, private chatService: ChatService) {
  }

  ngOnInit() {
    if (this.messageData.type !== MessageType.Text) {
      this.attachmentData = this.chatService.getAttachmentData(this.messageData.data).pipe(shareReplay(1));
      this.attachmentData.subscribe(data => {
        if (this.messageData.type === MessageType.Video) {
          const sourceTag = document.createElement("source");
          sourceTag.src = data.url;
          this.videoElement.nativeElement.appendChild(sourceTag);
          this.videoElement.nativeElement.onloadedmetadata = () => {
            console.log('loaded metadata');
            this.refresh.next()
          }
        }
        setTimeout(() => this.refresh.next(), 300);
      });
    }
  }

  ngAfterViewInit() {
    console.log('Loaded');
    setTimeout(() => this.refresh.next(), 300);
    this.refresh.next();
  }

  downloadFile(url: string) {
    window.open(url, '_blank');
  }
}
