import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../../../shared/services/Auth/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      tap(() => console.log('Auth Effect: Login action dispatched')),
      switchMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          tap((res) => console.log('Auth Effect: API response received', res)),
          map((res) => {

            const user = res.user || this.authService.getUserFromToken();
            if (!user) {
              throw new Error('Não foi possível extrair dados do usuário');
            }
            console.log('Auth Effect: Dispatching loginSuccess with user', user);
            return AuthActions.loginSuccess({ token: res.result.token, user });
          }),
          catchError((error) => {
            console.error('Auth Effect: Login error', error);
            return of(AuthActions.loginFailure({ error }));
          })
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => this.authService.logout())
      ),
    { dispatch: false }
  );
}
