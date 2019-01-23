import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input() sender: string;
  @Input() message: string;
  // TODO eliminar
  @Input() selfMessage: boolean = Math.random() >= 0.5;

  constructor() {
  }

  ngOnInit() {
  }

}
