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

  // Bỏ qua không nhét token vào request đang đi refresh
  if (request.url.includes('/refresh-token')) {
    return next(request);
  }

  // Nhét token vào Header nếu có
  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // SỬA LỖI Ở ĐÂY: Bắt cả lỗi 401 VÀ lỗi 403 từ Backend
      if (error.status === 401 || error.status === 403) {
        
        // Bạn có thể check thêm mã lỗi custom NextHire:AU001 nếu muốn chắc chắn 100% là lỗi chưa đăng nhập
        // const isAuthError = error.error?.error?.code === 'NextHire:AU001';

        // Nếu dưới LocalStorage đang có token -> Thử đi Refresh Token
        if (token) {
          return handle401Error(request, next, authService, router);
        } 
        // Nếu không có token -> Bị lỗi 403 -> Đá thẳng ra trang Login
        else {
          authService.clearLocalData();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }
      }
      
      // Các lỗi khác (500, 404, 400...) thì cứ ném ra bình thường
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
        // Refresh thất bại (Refresh token cũng tèo) -> Đăng xuất
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
    // Nếu đang có 1 request khác đi refresh rồi -> Đứng xếp hàng đợi
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((jwt) => {
        // Nhận được cờ báo hiệu refresh thất bại -> Giải tán request này
        if (jwt === 'EXPIRED') {
          return throwError(() => new Error('Refresh token failed'));
        }
        // Nhận được token mới -> Đi gọi lại API
        return next(
          request.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
        );
      })
    );
  }
};