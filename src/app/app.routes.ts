import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './shared/guards/auth.guard';
import { MicroFrontendContainerComponent } from './shared/components/mf-container/micro-frontend-container.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => Promise.resolve(MicroFrontendContainerComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'panel',
    loadComponent: () =>
      import('./pages/panel/panel.component').then((m) => m.PainelComponent),
    canActivate: [authGuard],
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./pages/transactions/transactions.component').then(
        (m) => m.TransactionsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cards',
    loadComponent: () =>
      import('./pages/cards/cards.component').then((m) => m.CardsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'investments',
    loadComponent: () =>
      import('./pages/investments/investments.component').then(
        (m) => m.InvestmentsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'configurations',
    loadComponent: () =>
      import('./pages/configurations/configurations.component').then(
        (m) => m.ConfigurationsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'other-services',
    loadComponent: () =>
      import('./pages/other-services/other-services.component').then(
        (m) => m.OtherServicesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
