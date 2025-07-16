import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/Auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Check if the request should skip authentication
  const skipAuth = req.headers.has('Skip-Auth');

  if (token && !skipAuth) {
    // Clone the request and add the authorization header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // If skipAuth is true, remove the Skip-Auth header before forwarding
  if (skipAuth) {
    const cleanReq = req.clone({
      headers: req.headers.delete('Skip-Auth'),
    });
    return next(cleanReq);
  }

  return next(req);
};
