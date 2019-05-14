import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DomChangeService {

  constructor() { }

  observe(
    elementToObserve: Element | Element[],
    callback: (value: MutationRecord[]) => void
  ): MutationObserver {

    const debouncer = new Subject<MutationRecord[]>();
    debouncer
      .pipe(debounceTime(150))
      .subscribe(callback);

    const changes = new MutationObserver((mutations: MutationRecord[]) => {
      debouncer.next(mutations);
    });

    // What changes will be observed
    const config: MutationObserverInit = {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    };

    this.getElements(elementToObserve)
      .forEach(element => changes.observe(element, config));

    return changes;
  }

  private getElements(elements: Element | Element[]): Element[] {
    if (Array.isArray(elements)) {
      return elements;
    } else {
      return [elements];
    }
  }

}
