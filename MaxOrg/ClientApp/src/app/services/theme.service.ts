import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {shareReplay} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _darkTheme = new BehaviorSubject<boolean>(localStorage.getItem('theme') === 'true');
  isDarkTheme = this._darkTheme.asObservable();

  constructor() {
  }

  set darkTheme(value: boolean) {
    this._darkTheme.next(value);
    localStorage.setItem('theme', value + '');
  }
}
