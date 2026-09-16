import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => next(req).pipe(
  catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      localStorage.removeItem('cartify_token');
      localStorage.removeItem('cartify_user');
    }
    return throwError(() => error);
  })
);
