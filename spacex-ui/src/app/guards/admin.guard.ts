import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensure().pipe(
    map(() => auth.current?.role === 'admin' ? true : router.parseUrl('/dashboard'))
  );
};
