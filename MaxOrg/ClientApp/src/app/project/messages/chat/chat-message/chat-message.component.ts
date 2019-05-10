import {Component, Input, OnInit} from '@angular/core';
import {UserService} from "../../../../services/user.service";
import {Message, MessageType} from "../../../services/chat-model";

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  MessageType = MessageType;

  @Input() sender: string;
  @Input() message: string;
  @Input() selfMessage: boolean = true;
  @Input() messageData: Message;

  constructor(private userService: UserService) {

  }

  ngOnInit() {
    console.log(this.messageData);
  }

}
