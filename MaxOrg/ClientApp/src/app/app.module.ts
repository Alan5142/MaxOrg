import {BrowserModule, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  GestureConfig,
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ServicesModule} from './services/services.module';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {TokenInterceptor} from "./utility/token-interceptor";
import {AuthServiceConfig, GoogleLoginProvider, SocialLoginModule} from "angularx-social-login";
import {DevopsAuthComponent} from './devops-auth/devops-auth.component';


@NgModule({
  declarations: [
    AppComponent,
    DevopsAuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    FlexLayoutModule,
    ServicesModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    MatTooltipModule,
    MatSnackBarModule,
    ServiceWorkerModule.register('service-worker.js', {enabled: environment.production}),
    MatProgressSpinnerModule
  ],
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("495753764174-j2egiqi9f0isoqelqfrqt7ptovuld4qn.apps.googleusercontent.com")
  }
]);

export function provideConfig() {
  return config;
}
