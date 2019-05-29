import {Component} from '@angular/core';
import {ThemeService} from "./services/theme.service";
import {UserService} from "./services/user.service";
import {SwUpdate} from "@angular/service-worker";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  constructor(public theme: ThemeService,
              private userService: UserService,
              private update: SwUpdate,
              private snackBar: MatSnackBar) {
    Notification.requestPermission().then((result) => {
      if (result === "denied") {
        alert('Puedes activar las notificaciones en la configuración de tu navegador');
      }
    });
    if (navigator.serviceWorker === undefined) {
      return;
    }
    update.available.subscribe(updateAvailable => {
      const snack = this.snackBar.open('Hay una actualización disponible', 'Recargar', {duration: 15000});
      snack
        .onAction()
        .subscribe(() => {
          window.location.reload();
        });
    }, err => {
    });
    navigator.serviceWorker.ready.then(registration => {
    })
  }
}
