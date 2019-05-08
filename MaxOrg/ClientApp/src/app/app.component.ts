import {Component} from '@angular/core';
import {ThemeService} from "./services/theme.service";
import {UserService} from "./services/user.service";
import {SwPush} from "@angular/service-worker";

import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  constructor(public theme: ThemeService, userService: UserService, private push: SwPush) {
    Notification.requestPermission().then((result) => {
      if (result === "denied") {
        alert('Puedes activar las notificaciones en la configuración de tu navegador');
      }
    });
    navigator.serviceWorker.ready.then(registration => {
      console.log('Succesfully registered service worker');
    })
  }
}
