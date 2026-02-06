import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameConfigService } from '../../services/game/game-config.service';

interface GameCard {
  id: string;
  name: string;
  description: string;
  gameNumber: number;
  route: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly gameConfigService = inject(GameConfigService);

  private readonly gameMetadata: Record<string, Omit<GameCard, 'id' | 'name' | 'description'>> = {
    '2048': {
      gameNumber: 128,
      route: '/games/2048',
      color: '#F59E0B',
      icon: '🎲'
    },
    'TANGO': {
      gameNumber: 436,
      route: '/games/tango',
      color: '#EC4899',
      icon: '🎯'
    },
    'QUEENS': {
      gameNumber: 596,
      route: '/games/queens',
      color: '#10B981',
      icon: '👑'
    }
  };

  games = computed(() => {
    const activeGames = this.gameConfigService.activeGames();
    return activeGames
      .map(game => {
        const metadata = this.gameMetadata[game.gameCode.toUpperCase()];
        if (!metadata) return null;
        return {
          id: game.gameCode,
          name: game.name,
          description: game.description,
          ...metadata
        };
      })
      .filter((game): game is GameCard => game !== null);
  });

  ngOnInit(): void {
    this.gameConfigService.loadGames();
  }

  navigateToGame(route: string): void {
    this.router.navigate([route]);
  }
}
