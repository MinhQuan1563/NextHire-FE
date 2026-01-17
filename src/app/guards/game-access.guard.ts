import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameConfigService } from '../services/game/game-config.service';

export const gameAccessGuard: CanActivateFn = (route) => {
  const gameConfigService = inject(GameConfigService);
  const router = inject(Router);

  const path = route.routeConfig?.path || '';
  const gameCode = path.split('/').pop() || '';

  const gameCodeMap: Record<string, string> = {
    '2048': '2048',
    'tango': 'TANGO',
    'queens': 'QUEENS'
  };

  const backendGameCode = gameCodeMap[gameCode.toLowerCase()] || gameCode;

  if (gameConfigService.activeGames().length === 0) {
    gameConfigService.loadGames();
  }

  const isActive = gameConfigService.isGameActive(backendGameCode);

  if (!isActive) {
    router.navigate(['/games']);
    return false;
  }

  return true;
};
