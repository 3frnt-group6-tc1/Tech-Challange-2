import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
  selectAuthError,
} from './state/auth.selectors';
import * as AuthActions from './state/auth.actions';
import { LoginRequest, AuthUser } from '../../../shared/services/Auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  isAuthenticated$: Observable<boolean>;
  user$: Observable<AuthUser | null>;
  loading$: Observable<boolean>;
  error$: Observable<any>;

  constructor(private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.user$ = this.store.select(selectUser);
    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  login(credentials: LoginRequest) {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
