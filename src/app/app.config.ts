import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideAbpCore, withOptions } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { provideAbpOAuth } from '@abp/ng.oauth';
import { provideStore } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    // KÍCH HOẠT ABP
    provideAbpCore(
      withOptions({
        environment, 
        registerLocaleFn: registerLocale(),
      })
    ),
    // provideAbpOAuth(),
    provideHttpClient(
      withInterceptors([errorInterceptor, authInterceptor]),
      withFetch()
    ),
    
    provideStore(),
    MessageService
  ],
};