import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const apiConfig = {
  // baseUrl: 'http://tech-challenge-2-alb-1096144064.us-east-1.elb.amazonaws.com',
  baseUrl: 'http://localhost:3000',
  usersEndpoint: '/users',
  accountsEndpoint: '/accounts',
  transactionsEndpoint: '/accounts/transaction',
  cardsEndpoint: '/cards',
  investmentsEndpoint: '/investments',
};

export const mfConfig = {
  siteUrl: 'http://localhost:4300',
};

export const systemConfig: {
  version: string;
  company: string;
  year: number;
  isLogged?: boolean;
  loggedPages: string[];
} = {
  version: '1.0.0',
  company: 'CDJMV',
  year: new Date().getFullYear(),
  isLogged: false,
  loggedPages: [
    '/panel',
    '/transactions',
    '/cards',
    '/investments',
    '/configurations',
    '/other-services',
  ],
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
