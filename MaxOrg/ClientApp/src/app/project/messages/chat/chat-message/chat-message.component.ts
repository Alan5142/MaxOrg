import {Component, Input, OnInit} from '@angular/core';
import {UserService} from "../../../../services/user.service";

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input() sender: string;
  @Input() message: string;
  // TODO eliminar
  @Input() selfMessage: boolean = true;

  constructor(private userService: UserService) {

  }

  ngOnInit() {
    console.log('self: ' + this.selfMessage);
  }

}
