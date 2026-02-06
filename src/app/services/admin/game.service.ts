import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PagedResultDto } from '../../models/page.model';
import {
  GameDto,
  CreateGameDto,
  UpdateGameDto,
  GetGamesInput
} from '../../models/admin/games';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Game`;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  getGames(input: GetGamesInput): Observable<PagedResultDto<GameDto>> {
    const httpParams = this.buildGetGamesParams(input);
    
    if (!environment.production) {
      console.log('[GameService] getGames called with input:', input);
    }

    return this.http.get<PagedResultDto<GameDto>>(this.baseUrl, { params: httpParams })
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[GameService] Retry attempt ${retryCount} for getGames`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getGames'))
      );
  }

  getGameByCode(gameCode: string): Observable<GameDto> {
    if (!gameCode) {
      return throwError(() => new Error('Game code is required'));
    }

    if (!environment.production) {
      console.log('[GameService] getGameByCode called with gameCode:', gameCode);
    }

    return this.http.get<GameDto>(`${this.baseUrl}/${gameCode}`)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (!environment.production) {
              console.warn(`[GameService] Retry attempt ${retryCount} for getGameByCode`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('getGameByCode'))
      );
  }

  createGame(input: CreateGameDto): Observable<GameDto> {
    if (!input.name || !input.description) {
      return throwError(() => new Error('Name and description are required'));
    }

    if (!environment.production) {
      console.log('[GameService] createGame called with input:', input);
    }

    return this.http.post<GameDto>(this.baseUrl, input)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (error.status === 400 || error.status === 409) {
              return throwError(() => error);
            }
            if (!environment.production) {
              console.warn(`[GameService] Retry attempt ${retryCount} for createGame`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('createGame'))
      );
  }

  updateGame(gameCode: string, input: UpdateGameDto): Observable<GameDto> {
    if (!gameCode) {
      return throwError(() => new Error('Game code is required'));
    }

    if (!environment.production) {
      console.log('[GameService] updateGame called with gameCode:', gameCode, 'input:', input);
    }

    return this.http.put<GameDto>(`${this.baseUrl}/${gameCode}`, input)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (error.status === 400 || error.status === 404) {
              return throwError(() => error);
            }
            if (!environment.production) {
              console.warn(`[GameService] Retry attempt ${retryCount} for updateGame`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('updateGame'))
      );
  }

  deleteGame(gameCode: string): Observable<boolean> {
    if (!gameCode) {
      return throwError(() => new Error('Game code is required'));
    }

    if (!environment.production) {
      console.log('[GameService] deleteGame called with gameCode:', gameCode);
    }

    return this.http.delete<boolean>(`${this.baseUrl}/${gameCode}`)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            if (error.status === 404 || error.status === 409) {
              return throwError(() => error);
            }
            if (!environment.production) {
              console.warn(`[GameService] Retry attempt ${retryCount} for deleteGame`, error);
            }
            return throwError(() => error).pipe(delay(this.retryDelay * retryCount));
          }
        }),
        catchError(this.handleError('deleteGame'))
      );
  }

  private buildGetGamesParams(input: GetGamesInput): HttpParams {
    let httpParams = new HttpParams()
      .set('SkipCount', input.skipCount.toString())
      .set('MaxResultCount', input.maxResultCount.toString());

    if (input.searchText) {
      httpParams = httpParams.set('SearchText', input.searchText);
    }

    if (input.isActive !== undefined && input.isActive !== null) {
      httpParams = httpParams.set('IsActive', input.isActive.toString());
    }

    return httpParams;
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client-side error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'You are not authorized to access this resource. Please log in.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The requested game was not found.';
            break;
          case 409:
            errorMessage = error.error?.message || 'A game with this code already exists or the game is currently in use.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Server error: ${error.status}`;
        }
      }

      if (!environment.production) {
        console.error(`[GameService] ${operation} failed:`, {
          error,
          message: errorMessage,
          status: error.status,
          statusText: error.statusText
        });
      }

      return throwError(() => new Error(errorMessage));
    };
  }
}
