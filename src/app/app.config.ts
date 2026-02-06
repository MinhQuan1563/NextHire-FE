import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideAbpCore, withOptions } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { provideAbpOAuth } from '@abp/ng.oauth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAnimations(),
    // Kích hoạt ABP Framework
    provideAbpCore(
      withOptions({
        environment: {
          production: false,
          application: {
            baseUrl: 'http://localhost:4200/',
            name: 'NextHireApp',
          },
          oAuthConfig: {
            issuer: 'https://localhost:44396/',
            clientId: 'NextHireApp_App',
            responseType: 'code',
            scope: 'offline_access NextHireApp',
            requireHttps: true,
          },
          apis: {
            default: {
              url: 'https://localhost:44396',
              rootNamespace: 'NextHireApp',
            },
          },
        },
        registerLocaleFn: registerLocale(),
      })
    ),
    provideAbpOAuth(),
  ],
};
