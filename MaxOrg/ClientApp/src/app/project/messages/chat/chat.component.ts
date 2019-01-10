import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {Location} from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input() userId: number;

  public items = Array.from({length: 1000}).map((_, i) => `Item #${i}`);

  constructor(public mediaObserver: MediaObserver, public location: Location) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
