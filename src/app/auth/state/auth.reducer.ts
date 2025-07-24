import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthUser } from '../../shared/services/Auth/auth.service';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: any;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { token, user }) => ({
    ...state,
    loading: false,
    token,
    user,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.logout, () => initialState)
);

export const AUTH_FEATURE_KEY = 'auth';
