import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Cell {
  value: number;
  isNew: boolean;
  isMerged: boolean;
}

interface GameHistory {
  gameCode: string;
  score: number;
  playedAt: string;
  bestTile: number;
}

@Component({
  selector: 'app-game2048',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game2048.component.html',
  styleUrls: ['./game2048.component.scss']
})
export class Game2048Component implements OnInit, OnDestroy {
  gridSize = 4;
  grid: Cell[][] = [];
  score = 0;
  bestScore = 0;
  isGameOver = false;
  isWon = false;
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadBestScore();
    this.initializeGrid();
    this.addRandomTile();
    this.addRandomTile();
  }

  ngOnDestroy(): void {}

  @HostListener('window:keydown', ['$event'])
  handleKeyPress(event: KeyboardEvent): void {
    if (this.isGameOver || this.isWon) return;

    let moved = false;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moved = this.move('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        moved = this.move('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moved = this.move('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        moved = this.move('right');
        break;
    }

    if (moved) {
      this.addRandomTile();
      this.checkGameState();
    }
  }

  initializeGrid(): void {
    this.grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = { value: 0, isNew: false, isMerged: false };
      }
    }
  }

  addRandomTile(): void {
    const emptyCells: { row: number; col: number }[] = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].value === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      this.grid[randomCell.row][randomCell.col] = { value, isNew: true, isMerged: false };
      
      setTimeout(() => {
        this.grid[randomCell.row][randomCell.col].isNew = false;
      }, 200);
    }
  }

  move(direction: string): boolean {
    this.clearMergedFlags();
    let moved = false;

    if (direction === 'left') {
      for (let row = 0; row < this.gridSize; row++) {
        moved = this.moveRowLeft(row) || moved;
      }
    } else if (direction === 'right') {
      for (let row = 0; row < this.gridSize; row++) {
        moved = this.moveRowRight(row) || moved;
      }
    } else if (direction === 'up') {
      for (let col = 0; col < this.gridSize; col++) {
        moved = this.moveColumnUp(col) || moved;
      }
    } else if (direction === 'down') {
      for (let col = 0; col < this.gridSize; col++) {
        moved = this.moveColumnDown(col) || moved;
      }
    }

    return moved;
  }

  moveRowLeft(row: number): boolean {
    const values = this.grid[row].map(cell => cell.value).filter(val => val !== 0);
    const merged: number[] = [];
    
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] === values[i + 1]) {
        merged.push(values[i] * 2);
        this.score += values[i] * 2;
        values.splice(i, 2);
        i--;
      } else {
        merged.push(values[i]);
      }
    }
    if (values.length > 0) merged.push(...values);
    
    while (merged.length < this.gridSize) merged.push(0);
    
    let changed = false;
    for (let col = 0; col < this.gridSize; col++) {
      if (this.grid[row][col].value !== merged[col]) {
        changed = true;
      }
      this.grid[row][col].value = merged[col];
      this.grid[row][col].isMerged = merged[col] !== 0 && col < merged.findIndex(v => v === 0);
    }
    
    return changed;
  }

  moveRowRight(row: number): boolean {
    const values = this.grid[row].map(cell => cell.value).filter(val => val !== 0);
    const merged: number[] = [];
    
    for (let i = values.length - 1; i > 0; i--) {
      if (values[i] === values[i - 1]) {
        merged.unshift(values[i] * 2);
        this.score += values[i] * 2;
        values.splice(i - 1, 2);
        i--;
      } else {
        merged.unshift(values[i]);
      }
    }
    if (values.length > 0) merged.unshift(...values);
    
    while (merged.length < this.gridSize) merged.unshift(0);
    
    let changed = false;
    for (let col = 0; col < this.gridSize; col++) {
      if (this.grid[row][col].value !== merged[col]) {
        changed = true;
      }
      this.grid[row][col].value = merged[col];
      this.grid[row][col].isMerged = merged[col] !== 0 && col > merged.lastIndexOf(0);
    }
    
    return changed;
  }

  moveColumnUp(col: number): boolean {
    const values = this.grid.map(row => row[col].value).filter(val => val !== 0);
    const merged: number[] = [];
    
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] === values[i + 1]) {
        merged.push(values[i] * 2);
        this.score += values[i] * 2;
        values.splice(i, 2);
        i--;
      } else {
        merged.push(values[i]);
      }
    }
    if (values.length > 0) merged.push(...values);
    
    while (merged.length < this.gridSize) merged.push(0);
    
    let changed = false;
    for (let row = 0; row < this.gridSize; row++) {
      if (this.grid[row][col].value !== merged[row]) {
        changed = true;
      }
      this.grid[row][col].value = merged[row];
      this.grid[row][col].isMerged = merged[row] !== 0 && row < merged.findIndex(v => v === 0);
    }
    
    return changed;
  }

  moveColumnDown(col: number): boolean {
    const values = this.grid.map(row => row[col].value).filter(val => val !== 0);
    const merged: number[] = [];
    
    for (let i = values.length - 1; i > 0; i--) {
      if (values[i] === values[i - 1]) {
        merged.unshift(values[i] * 2);
        this.score += values[i] * 2;
        values.splice(i - 1, 2);
        i--;
      } else {
        merged.unshift(values[i]);
      }
    }
    if (values.length > 0) merged.unshift(...values);
    
    while (merged.length < this.gridSize) merged.unshift(0);
    
    let changed = false;
    for (let row = 0; row < this.gridSize; row++) {
      if (this.grid[row][col].value !== merged[row]) {
        changed = true;
      }
      this.grid[row][col].value = merged[row];
      this.grid[row][col].isMerged = merged[row] !== 0 && row > merged.lastIndexOf(0);
    }
    
    return changed;
  }

  clearMergedFlags(): void {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col].isMerged = false;
      }
    }
  }

  checkGameState(): void {
    // Check for 2048 tile (win condition)
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].value === 2048) {
          this.isWon = true;
          this.saveBestScore();
          this.saveGameHistory();
          return;
        }
      }
    }

    // Check if any moves are possible
    if (!this.canMove()) {
      this.isGameOver = true;
      this.saveBestScore();
      this.saveGameHistory();
    }
  }

  canMove(): boolean {
    // Check for empty cells
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].value === 0) return true;
      }
    }

    // Check for possible merges horizontally
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize - 1; col++) {
        if (this.grid[row][col].value === this.grid[row][col + 1].value) return true;
      }
    }

    // Check for possible merges vertically
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize - 1; row++) {
        if (this.grid[row][col].value === this.grid[row + 1][col].value) return true;
      }
    }

    return false;
  }

  getBestTile(): number {
    let max = 0;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        max = Math.max(max, this.grid[row][col].value);
      }
    }
    return max;
  }

  loadBestScore(): void {
    const saved = localStorage.getItem('2048-best-score');
    this.bestScore = saved ? parseInt(saved) : 0;
  }

  saveBestScore(): void {
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('2048-best-score', this.bestScore.toString());
    }
  }

  saveGameHistory(): void {
    const history: GameHistory = {
      gameCode: '2048',
      score: this.score,
      playedAt: new Date().toISOString(),
      bestTile: this.getBestTile()
    };

    const existingHistory = localStorage.getItem('gameHistory');
    const historyArray = existingHistory ? JSON.parse(existingHistory) : [];
    historyArray.push(history);
    localStorage.setItem('gameHistory', JSON.stringify(historyArray));
  }

  resetGame(): void {
    this.score = 0;
    this.isGameOver = false;
    this.isWon = false;
    this.initializeGrid();
    this.addRandomTile();
    this.addRandomTile();
  }

  goBack(): void {
    this.router.navigate(['/games']);
  }

  getTileColor(value: number): string {
    const colors: { [key: number]: string } = {
      0: '#cdc1b4',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  }

  getTextColor(value: number): string {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  }
}
