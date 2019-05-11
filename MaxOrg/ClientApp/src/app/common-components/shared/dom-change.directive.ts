import {Directive, ElementRef, EventEmitter, OnDestroy, Output} from '@angular/core';
import {DomChangeService} from './dom-change.service';

/**
 * Directive to trigger some action when associated content has the DOM changed.
 *
 * The `cdkObserveContent` of the Angular Material should have worked,
 * but it was noted that, for example, it did not detect the change of the
 * `disabled` attribute of an element.
 *
 * References:
 * - https://material.angular.io/cdk/observers/overview
 * - https://github.com/angular/material2/blob/d83059b6deb021193c0964eecf75452ffaf1dd0a/src/cdk/observers/observe-content.ts
 * - https://nitayneeman.com/posts/listening-to-dom-changes-using-mutationobserver-in-angular/
 */
@Directive({
  selector: '[appDomChange]',
  exportAs: 'appDomChange'
})
export class DomChangeDirective implements OnDestroy {

  private changes: MutationObserver;

  @Output()
  public appDomChange = new EventEmitter<MutationRecord[]>();

  constructor(
    elementRef: ElementRef,
    domChangeService: DomChangeService
  ) {
    this.changes = domChangeService.observe(
      elementRef.nativeElement,
      mutation => this.appDomChange.emit(mutation)
    );
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

}
