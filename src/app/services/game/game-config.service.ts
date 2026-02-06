import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface GameConfig {
  gameCode: string;
  name: string;
  description: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameConfigService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Game`;

  activeGames = signal<GameConfig[]>([]);
  isLoading = signal<boolean>(false);

  loadGames(): void {
    this.isLoading.set(true);
    
    this.http.get<{ items: GameConfig[]; totalCount: number }>(`${this.baseUrl}`, {
      params: {
        IsActive: 'true',
        SkipCount: '0',
        MaxResultCount: '100'
      }
    }).subscribe({
      next: (response) => {
        this.activeGames.set(response.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load games:', err);
        this.isLoading.set(false);
      }
    });
  }

  isGameActive(gameCode: string): boolean {
    return this.activeGames().some(game => 
      game.gameCode.toLowerCase() === gameCode.toLowerCase() && game.isActive
    );
  }

  getGameByCode(gameCode: string): GameConfig | undefined {
    return this.activeGames().find(game => 
      game.gameCode.toLowerCase() === gameCode.toLowerCase()
    );
  }
}
