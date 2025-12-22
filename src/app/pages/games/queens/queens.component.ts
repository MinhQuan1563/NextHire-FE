import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Cell {
  hasQueen: boolean;
  isAttacked: boolean;
  isSelected: boolean;
  region: number;
}

interface GameHistory {
  gameCode: string;
  score: number;
  playedAt: string;
  time: number;
}

@Component({
  selector: 'app-queens',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queens.component.html',
  styleUrls: ['./queens.component.scss']
})
export class QueensComponent implements OnInit, OnDestroy {
  gridSize = 6;
  grid: Cell[][] = [];
  queensPlaced = 0;
  totalQueens = 6;
  regions: number[][] = [];
  regionColors: string[] = [
    '#FCA5A5', '#FBBF24', '#A3E635', '#67E8F9',
    '#A78BFA', '#F472B6'
  ];
  
  score = 0;
  timer = 0;
  timerInterval: any;
  isGameWon = false;
  showInvalidMove = false;
  hintCell: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeGrid();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  initializeGrid(): void {
    this.grid = [];
    this.queensPlaced = 0;

    // Generate daily regions
    if (this.regions.length === 0) {
      this.generateDailyRegions();
    }

    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = {
          hasQueen: false,
          isAttacked: false,
          isSelected: false,
          region: this.regions[row][col]
        };
      }
    }
  }

  generateDailyRegions(): void {
    const seed = this.getDailySeed();
    const rng = this.seededRandom(seed);
    
    // Use one of several predefined region patterns based on seed (6x6 grid)
    // Each pattern has been verified to have at least one valid solution
    const patterns = [
      [
        [0, 0, 1, 1, 2, 2],
        [0, 0, 1, 1, 2, 2],
        [3, 0, 1, 4, 4, 2],
        [3, 3, 4, 4, 5, 5],
        [3, 3, 4, 5, 5, 5],
        [3, 3, 4, 4, 5, 5]
      ],
      [
        [0, 0, 0, 1, 1, 1],
        [0, 2, 2, 2, 1, 1],
        [0, 2, 3, 2, 4, 4],
        [3, 3, 3, 4, 4, 5],
        [3, 3, 4, 4, 5, 5],
        [3, 4, 4, 5, 5, 5]
      ],
      [
        [0, 0, 0, 1, 1, 1],
        [0, 2, 1, 1, 3, 1],
        [2, 2, 2, 3, 3, 3],
        [2, 4, 4, 3, 5, 5],
        [4, 4, 4, 5, 5, 5],
        [4, 4, 5, 5, 5, 5]
      ]
    ];
    
    const patternIndex = Math.floor(rng() * patterns.length);
    this.regions = patterns[patternIndex];
  }

  getDailySeed(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();
    
    // Reset at 3 PM (15:00)
    if (hour < 15) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.getFullYear() * 10000 + (yesterday.getMonth() + 1) * 100 + yesterday.getDate();
    }
    
    return year * 10000 + (month + 1) * 100 + day;
  }

  seededRandom(seed: number): () => number {
    let state = seed;
    return function() {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }

  startTimer(): void {
    this.timer = 0;
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  onCellClick(row: number, col: number): void {
    const cell = this.grid[row][col];

    if (cell.hasQueen) {
      // Remove queen
      cell.hasQueen = false;
      this.queensPlaced--;
      this.updateAttackedCells();
      this.showInvalidMove = false;
      return;
    }

    // Check if region already has a queen
    const regionHasQueen = this.hasQueenInRegion(cell.region);
    if (regionHasQueen || cell.isAttacked) {
      // Invalid move
      this.showInvalidMove = true;
      setTimeout(() => {
        this.showInvalidMove = false;
      }, 1000);
      return;
    }

    // Place queen
    cell.hasQueen = true;
    this.queensPlaced++;
    this.updateAttackedCells();

    // Check win condition
    if (this.queensPlaced === this.totalQueens) {
      this.stopTimer();
      this.calculateScore();
      this.saveGameHistory();
      // Delay to show final state before modal
      setTimeout(() => {
        this.isGameWon = true;
      }, 500);
    }
  }

  hasQueenInRegion(region: number): boolean {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].region === region && this.grid[row][col].hasQueen) {
          return true;
        }
      }
    }
    return false;
  }

  updateAttackedCells(): void {
    // Reset all attacked cells
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col].isAttacked = false;
      }
    }

    // Mark attacked cells for each queen
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].hasQueen) {
          this.markAttackedCells(row, col);
        }
      }
    }
  }

  markAttackedCells(queenRow: number, queenCol: number): void {
    // Mark horizontal
    for (let col = 0; col < this.gridSize; col++) {
      if (col !== queenCol && !this.grid[queenRow][col].hasQueen) {
        this.grid[queenRow][col].isAttacked = true;
      }
    }

    // Mark vertical
    for (let row = 0; row < this.gridSize; row++) {
      if (row !== queenRow && !this.grid[row][queenCol].hasQueen) {
        this.grid[row][queenCol].isAttacked = true;
      }
    }

    // Mark diagonal (top-left to bottom-right)
    let row = queenRow - 1;
    let col = queenCol - 1;
    while (row >= 0 && col >= 0) {
      if (!this.grid[row][col].hasQueen) {
        this.grid[row][col].isAttacked = true;
      }
      row--;
      col--;
    }
    row = queenRow + 1;
    col = queenCol + 1;
    while (row < this.gridSize && col < this.gridSize) {
      if (!this.grid[row][col].hasQueen) {
        this.grid[row][col].isAttacked = true;
      }
      row++;
      col++;
    }

    // Mark diagonal (top-right to bottom-left)
    row = queenRow - 1;
    col = queenCol + 1;
    while (row >= 0 && col < this.gridSize) {
      if (!this.grid[row][col].hasQueen) {
        this.grid[row][col].isAttacked = true;
      }
      row--;
      col++;
    }
    row = queenRow + 1;
    col = queenCol - 1;
    while (row < this.gridSize && col >= 0) {
      if (!this.grid[row][col].hasQueen) {
        this.grid[row][col].isAttacked = true;
      }
      row++;
      col--;
    }
  }

  getCellColor(row: number, col: number): string {
    const cell = this.grid[row][col];
    const regionColor = this.regionColors[cell.region];

    if (cell.isAttacked && !cell.hasQueen) {
      // Darken region color for attacked cells (but not queen cells)
      return this.darkenColor(regionColor);
    }

    return regionColor;
  }

  darkenColor(color: string): string {
    // Simple darkening by reducing opacity
    return color + '80';
  }

  showHint(): void {
    this.hintCell = null;
    
    // Check for invalid queen placements first
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const cell = this.grid[row][col];
        if (cell.hasQueen) {
          // Check if this queen is attacking another queen
          if (this.isQueenInvalid(row, col)) {
            this.hintCell = `${row},${col}`;
            setTimeout(() => { this.hintCell = null; }, 2000);
            return;
          }
        }
      }
    }

    // No invalid queens, suggest next move
    // Find first row without a queen
    for (let row = 0; row < this.gridSize; row++) {
      let hasQueenInRow = false;
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].hasQueen) {
          hasQueenInRow = true;
          break;
        }
      }
      
      if (!hasQueenInRow) {
        // Find valid position in this row
        for (let col = 0; col < this.gridSize; col++) {
          const cell = this.grid[row][col];
          const regionHasQueen = this.hasQueenInRegion(cell.region);
          if (!cell.isAttacked && !regionHasQueen) {
            this.hintCell = `${row},${col}`;
            setTimeout(() => { this.hintCell = null; }, 2000);
            return;
          }
        }
      }
    }
  }

  isQueenInvalid(row: number, col: number): boolean {
    // Check if this queen attacks another queen
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
        if (this.grid[r][c].hasQueen) {
          return true;
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  isHintCell(row: number, col: number): boolean {
    return this.hintCell === `${row},${col}`;
  }

  calculateScore(): void {
    const baseScore = 1000;
    const timeBonus = Math.max(0, 600 - this.timer);
    this.score = baseScore + timeBonus * 2;
  }

  saveGameHistory(): void {
    const history: GameHistory = {
      gameCode: 'QUEENS',
      score: this.score,
      playedAt: new Date().toISOString(),
      time: this.timer
    };

    const existingHistory = localStorage.getItem('gameHistory');
    const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
    historyArray.push(history);
    localStorage.setItem('gameHistory', JSON.stringify(historyArray));
  }

  resetGame(): void {
    this.isGameWon = false;
    this.score = 0;
    this.showInvalidMove = false;
    this.hintCell = null;
    // Clear all queens
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col].hasQueen = false;
      }
    }
    this.queensPlaced = 0;
    this.updateAttackedCells();
    // Don't reset timer
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
