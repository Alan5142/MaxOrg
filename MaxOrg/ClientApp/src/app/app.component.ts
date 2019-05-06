import {Component} from '@angular/core';
import {ThemeService} from "./services/theme.service";
import {UserService} from "./services/user.service";
import {SwPush} from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  constructor(public theme: ThemeService, userService: UserService, private push: SwPush) {
    Notification.requestPermission(function (result) {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(function (registration) {
          console.log('Succesfully registered service worker');
        });
      }
    });
  }
}
