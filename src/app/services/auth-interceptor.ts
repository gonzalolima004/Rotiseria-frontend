import { HttpInterceptorFn } from '@angular/common/http';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  console.debug('AuthInterceptor token (raw):', token);

  if (token) {
    const sanitizedToken = String(token)
      .replace(/^\"|\"$/g, '')
      .replace(/^Bearer\s+/i, '')
      .trim();

    console.debug('AuthInterceptor token (sanitized):',
      sanitizedToken);

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${sanitizedToken}` }
    });

    return next(authReq);
  }

  return next(req);
};