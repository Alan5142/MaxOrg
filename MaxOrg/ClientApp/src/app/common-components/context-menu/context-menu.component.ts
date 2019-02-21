import {Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {Overlay, OverlayRef} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';
import {fromEvent} from 'rxjs';
import {filter, take} from 'rxjs/operators';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {

  @ViewChild('contextMenu') userMenu: TemplateRef<any>;

  overlayRef: OverlayRef | null;

  constructor(
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef) {
  }

  ngOnInit() {
  }

  open(event: MouseEvent) {
    this.close();
    const {x, y} = event;
    event.preventDefault();
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({x, y})
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(new TemplatePortal(this.userMenu, this.viewContainerRef));
    fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(ev => {
          const clickTarget = ev.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      ).subscribe(() => this.close());
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
