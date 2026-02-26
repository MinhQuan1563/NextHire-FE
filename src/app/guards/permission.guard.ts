import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { PermissionService } from '@abp/ng.core';
import { AuthService } from '../services/auth/auth.service';

export const PermissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }});
    return false;
  }

  const requiredPolicy = route.data['requiredPolicy'] as string;

  if (!requiredPolicy) {
    return true;
  }

  if (permissionService.getGrantedPolicy(requiredPolicy)) {
    return true;
  }

  router.navigate(['/forbidden']); 
  return false;
};