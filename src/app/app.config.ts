import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { environment } from '../../environment.prod';
import { balanceReducer } from './store/balance/balance.reducer';
import { BalanceEffects } from './store/balance/balance.effects';
import { AccountService } from './shared/services/Account/account.service';

export const apiConfig = { 
  baseUrl: ' http://tech-challenge-2-alb-461814711.us-east-1.elb.amazonaws.com/',
  usersEndpoint: '/users',
  accountsEndpoint: '/accounts',
  transactionsEndpoint: '/accounts/transaction',
  cardsEndpoint: '/cards',
  investmentsEndpoint: '/investments',
};

export const mfConfig = {
  siteUrl: environment.mfBaseUrl,
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
    provideStore({
      balance: balanceReducer
    }),
    provideEffects([BalanceEffects]),
    AccountService,
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
