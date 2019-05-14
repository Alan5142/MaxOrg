import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

/**
 * Directive to know if it was clicked outside element.
 */
@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  constructor(private _elementRef: ElementRef) { }

  @Output()
  public appClickOutside = new EventEmitter();

  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    const clickedInside = this._elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
        this.appClickOutside.emit(null);
    }
  }

}
