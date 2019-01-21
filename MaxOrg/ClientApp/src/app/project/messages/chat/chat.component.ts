import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {Location} from '@angular/common';
import {CdkVirtualScrollViewport} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @Input() userId: number;
  @ViewChild('scrollViewPort') scrollViewPort: CdkVirtualScrollViewport;

  public items = Array.from({length: 10000}).map((_, i) => `Item #${i}`);

  constructor(public mediaObserver: MediaObserver, public location: Location) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.scrollViewPort.scrollToIndex(this.items.length, 'instant');
    }, 1);
  }

  ngAfterViewInit() {
  }
}
