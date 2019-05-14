import {Directive, ElementRef, EventEmitter, OnDestroy, Output} from '@angular/core';
import {InViewportEntry, InViewportService} from './in-viewport.service';

/**
 * Directive to know if an element is in the viewport or not.
 */
@Directive({
  selector: '[appInViewport]',
  exportAs: 'appInViewport'
})
export class InViewportDirective implements OnDestroy {

  private intersections: IntersectionObserver;

  @Output()
  public appInViewport = new EventEmitter<boolean>();

  constructor(
    elementRef: ElementRef,
    inViewportService: InViewportService
  ) {
    this.intersections = inViewportService.observe(
      elementRef.nativeElement,
      (entry: InViewportEntry) => {
        // Only the first is relevant because this class only observers one element
        this.appInViewport.emit(entry.entries[0].isIntersecting);
      }
    );
  }

  ngOnDestroy(): void {
    this.intersections.disconnect();
  }

}
