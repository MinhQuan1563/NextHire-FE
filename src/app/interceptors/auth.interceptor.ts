import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (request.url.includes('/refresh-token')) {
    return next(request);
  }

  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // =====================================
      // LỖI 401 (HẾT HẠN TOKEN) -> REFRESH
      // =====================================
      if (error.status === 401) {
        if (token) {
          return handle401Error(request, next, authService, router);
        } else {
          authService.clearLocalData();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }
      }

      // =====================================
      // LỖI 403 (KHÔNG CÓ QUYỀN) -> ĐÁ SANG TRANG FORBIDDEN
      // =====================================
      if (error.status === 403) {
        router.navigate(['/forbidden']); 
        return throwError(() => error);
      }
      
      return throwError(() => error);
    })
  );
};

// Hàm xử lý đi gọi Refresh Token
const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.accessToken);
        
        // Refresh thành công -> Lấy token mới gọi lại cái API vừa bị xịt
        return next(
          request.clone({ setHeaders: { Authorization: `Bearer ${tokenResponse.accessToken}` } })
        );
      }),
      catchError((err) => {
        // Refresh thất bại -> Đăng xuất
        isRefreshing = false;
        authService.clearLocalData();
        
        // Phóng thích các request đang bị "treo"
        refreshTokenSubject.next('EXPIRED'); 
        
        router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  } 
  else {
    // Đứng xếp hàng đợi
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((jwt) => {
        if (jwt === 'EXPIRED') {
          return throwError(() => new Error('Refresh token failed'));
        }
        return next(
          request.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
        );
      })
    );
  }
};