import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {Location} from '@angular/common';
import {VirtualScrollerComponent} from 'ngx-virtual-scroller';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input() userId: number;
  @ViewChild('scroll') virtualScroll: VirtualScrollerComponent;

  public items = Array.from({length: 100}).map((_, i) => `Item #${i}`);

  constructor(public mediaObserver: MediaObserver, public location: Location) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.virtualScroll.scrollToIndex(this.items.length - 1, true, 0, 0);
    }, 1);
  }

  ngAfterViewInit() {
  }
}
