import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    // ✅ Solo si estamos en navegador
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');

      if (token) {
        const sanitized = token.replace(/^"|"$/g, '').trim();

        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${sanitized}`,
          },
        });

        return next(authReq);
      } else {
        console.warn('⚠️ AuthInterceptor: No se encontró token en localStorage');
      }
    }
  } catch (err) {
    console.error('❌ Error en AuthInterceptor:', err);
  }

  // Si no hay token, continuar la request normal
  return next(req);
};
