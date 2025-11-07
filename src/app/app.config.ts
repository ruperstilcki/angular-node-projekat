import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { REST_URL, AUTH_URL } from './tokens/app-config.tokes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

    // 👇 add your global constant here
    { provide: REST_URL, useValue: 'http://localhost:3000/api/posts/' },
    { provide: AUTH_URL, useValue: 'http://localhost:3000/api/user/' }
  ]
};
