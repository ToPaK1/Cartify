import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const user = JSON.parse(localStorage.getItem('cartify_user') || 'null');
    return user?.role === 'admin' ? true : router.createUrlTree(['/']);
  } catch {
    return router.createUrlTree(['/']);
  }
};
