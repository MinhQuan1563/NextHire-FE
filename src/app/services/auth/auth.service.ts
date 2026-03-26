import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../../models/auth/auth.model';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { clear } from 'node:console';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        this.currentUserSubject.next(JSON.parse(userData));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }

  getUserCodeFromToken(): string | null {
    if (!this.isBrowser) return null;

    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded['user_code'] || decoded['sub'] || null;
    } 
    catch (error) {
      console.error('ERROR: Decode token', error);
      return null;
    }
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      tap((response) => {
        if (this.isBrowser) {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
        }
        this.getUserProfile().subscribe();
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const formData = new FormData();
    formData.append('refreshToken', refreshToken);

    return this.http.post<any>(`${this.apiUrl}/Refresh`, formData).pipe(
      tap((response) => {
        if (this.isBrowser) {
          localStorage.setItem('access_token', response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
        }
      })
    );
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('refresh_token');
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      registerRequest,
    );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/UserProfile/get`).pipe(
      tap((user) => {
        if (this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      }),
    );
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('access_token');
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request);
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearLocalData();
      }),
      catchError((error) => {
        this.clearLocalData();
        
        return of(null);
      })
    );
  }

  clearLocalData(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  /**
   * Check if current user has Admin role
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.some(role => role.toLowerCase() === 'admin');
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
