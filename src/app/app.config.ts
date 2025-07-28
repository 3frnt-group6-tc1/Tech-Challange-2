import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { AUTH_FEATURE_KEY, authReducer } from './store/ngrx/auth/state/auth.reducer';
import { AuthEffects } from './store/ngrx/auth/state/auth.effects';
import { BALANCE_FEATURE_KEY, balanceReducer } from './store/ngrx/balance/balance.reducer';
import { BalanceEffects } from './store/ngrx/balance/balance.effects';

export const apiConfig = {
  baseUrl: 'http://tech-challenge-2-alb-1096144064.us-east-1.elb.amazonaws.com',
  usersEndpoint: '/users',
  accountsEndpoint: '/accounts',
  transactionsEndpoint: '/accounts/transaction',
  cardsEndpoint: '/cards',
  investmentsEndpoint: '/investments',
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
    // NgRx store setup
    provideStore({ 
      [AUTH_FEATURE_KEY]: authReducer,
      [BALANCE_FEATURE_KEY]: balanceReducer 
    }),
    provideEffects([AuthEffects, BalanceEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};
