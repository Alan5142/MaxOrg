import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

export interface InViewportEntry {
  entries: IntersectionObserverEntry[];
  observer: IntersectionObserver;
}

@Injectable({
  providedIn: 'root'
})
export class InViewportService {

  constructor() { }

  observe(
    elementToObserve: Element,
    callback: (entries: InViewportEntry) => void
  ): IntersectionObserver {

    const debouncer = new Subject<InViewportEntry>();
    debouncer
      .pipe(debounceTime(150))
      .subscribe(callback);

    const config: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8 // parameterize in the future according to the need
    };

    const internalCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      debouncer.next({ entries, observer });
    };

    const intersections = new IntersectionObserver(internalCallback, config);

    intersections.observe(elementToObserve);

    return intersections;
  }

}
