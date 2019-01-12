import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
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
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollViewPort.scrollToIndex(this.items.length);
    }, 1);
  }
}
