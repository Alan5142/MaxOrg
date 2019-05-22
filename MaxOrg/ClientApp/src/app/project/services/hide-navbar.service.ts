import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HideNavbarService {
  private _subject = new BehaviorSubject<boolean>(false);
  hide = this._subject.asObservable();

  constructor() {
  }

  setValue(next: boolean) {
    this._subject.next(next);
  }
}
