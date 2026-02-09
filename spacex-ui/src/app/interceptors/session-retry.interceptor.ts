import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, switchMap, throwError, timer } from 'rxjs';

function shouldRetry(req: HttpRequest<unknown>, status: number) {
  return req.method === 'GET' && status === 401;
}

export const sessionRetryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(err => {
      if (!shouldRetry(req, err.status)) {
        return throwError(() => err);
      }

      // Give the session cookie a moment to settle, then retry once
      return timer(200).pipe(
        switchMap(() => next(req)),
        catchError(err2 => throwError(() => err2))
      );
    })
  );
};
