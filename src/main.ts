import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { authInterceptor } from './app/services/auth-interceptor';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideRouter(routes)
  ]
}).catch((err) => console.error(err));
