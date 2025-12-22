import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
export class GamesComponent {
  games: GameCard[] = [
    {
      id: '2048',
      name: '2048',
      description: 'Slide tiles to combine numbers and reach 2048. A addictive number puzzle!',
      gameNumber: 128,
      route: '/games/2048',
      color: '#F59E0B',
      icon: '🎲'
    },
    {
      id: 'tango',
      name: 'Tango',
      description: 'Fill the grid by placing numbered tiles in sequence. Plan your moves carefully!',
      gameNumber: 436,
      route: '/games/tango',
      color: '#EC4899',
      icon: '🎯'
    },
    {
      id: 'queens',
      name: 'Queens',
      description: 'Place queens on the board so none can attack each other. A classic puzzle!',
      gameNumber: 596,
      route: '/games/queens',
      color: '#10B981',
      icon: '👑'
    }
  ];

  constructor(private router: Router) {}

  navigateToGame(route: string): void {
    this.router.navigate([route]);
  }
}
