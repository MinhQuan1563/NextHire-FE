import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Cell {
  value: 'sun' | 'moon' | null;
  isFixed: boolean;
  isSelected: boolean;
}

interface GameHistory {
  gameCode: string;
  score: number;
  playedAt: string;
  time: number;
}

@Component({
  selector: 'app-tango',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tango.component.html',
  styleUrls: ['./tango.component.scss']
})
export class TangoComponent implements OnInit, OnDestroy {
  gridSize = 6;
  grid: Cell[][] = [];
  selectedSymbol: 'sun' | 'moon' = 'sun';
  errorCells: Set<string> = new Set();
  hintCell: string | null = null;
  
  score = 0;
  timer = 0;
  timerInterval: any;
  isGameWon = false;

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
    this.selectedSymbol = 'sun';
    this.errorCells.clear();

    // Create empty grid
    for (let row = 0; row < this.gridSize; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.grid[row][col] = {
          value: null,
          isFixed: false,
          isSelected: false
        };
      }
    }

    // Get daily seed and generate fixed positions
    const seed = this.getDailySeed();
    const rng = this.seededRandom(seed);
    const fixedCount = 8 + Math.floor(rng() * 3); // 8-10 fixed positions (easier)
    const fixedPositions: { row: number; col: number; value: 'sun' | 'moon' }[] = [];
    
    // Strategy: Spread fixed cells to ensure solvability
    // Track counts per row/column to avoid over-constraining
    const rowSunCount = new Array(this.gridSize).fill(0);
    const rowMoonCount = new Array(this.gridSize).fill(0);
    const colSunCount = new Array(this.gridSize).fill(0);
    const colMoonCount = new Array(this.gridSize).fill(0);
    
    let attempts = 0;
    while (fixedPositions.length < fixedCount && attempts < 200) {
      attempts++;
      const row = Math.floor(rng() * this.gridSize);
      const col = Math.floor(rng() * this.gridSize);
      const value: 'sun' | 'moon' = rng() > 0.5 ? 'sun' : 'moon';
      
      // Check if position already taken
      if (fixedPositions.some(p => p.row === row && p.col === col)) {
        continue;
      }
      
      // Check if adding this would over-constrain the puzzle
      const currentRowCount = value === 'sun' ? rowSunCount[row] : rowMoonCount[row];
      const currentColCount = value === 'sun' ? colSunCount[col] : colMoonCount[col];
      
      // Don't fill more than gridSize/2 - 1 of same type in any row/col
      // This leaves room for solution
      if (currentRowCount >= this.gridSize / 2 - 1 || currentColCount >= this.gridSize / 2 - 1) {
        continue;
      }
      
      // Temporarily place the value
      fixedPositions.push({ row, col, value });
      
      // Update grid temporarily
      this.grid[row][col] = {
        value: value,
        isFixed: true,
        isSelected: false
      };
      
      // Check if this placement violates rules
      const tempErrors = new Set<string>();
      this.checkRulesForFixedCells(fixedPositions, tempErrors);
      
      if (tempErrors.size > 0) {
        // This placement violates rules, remove it
        fixedPositions.pop();
        this.grid[row][col] = {
          value: null,
          isFixed: false,
          isSelected: false
        };
      } else {
        // Valid placement, update counts
        if (value === 'sun') {
          rowSunCount[row]++;
          colSunCount[col]++;
        } else {
          rowMoonCount[row]++;
          colMoonCount[col]++;
        }
      }
    }

    // Apply final fixed positions
    fixedPositions.forEach(pos => {
      this.grid[pos.row][pos.col] = {
        value: pos.value,
        isFixed: true,
        isSelected: false
      };
    });
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

    // Can't click fixed cells
    if (cell.isFixed) return;

    // Cycle through: null -> sun -> moon -> null (always allow placement)
    if (cell.value === null) {
      cell.value = 'sun';
    } else if (cell.value === 'sun') {
      cell.value = 'moon';
    } else if (cell.value === 'moon') {
      cell.value = null;
    }

    // Validate entire grid and mark errors
    this.validateGrid();

    // Check win condition (only if no errors)
    if (this.isGridComplete() && this.errorCells.size === 0) {
      this.stopTimer();
      this.calculateScore();
      this.saveGameHistory();
      // Delay to show final state before modal
      setTimeout(() => {
        this.isGameWon = true;
      }, 500);
    }
  }

  validateGrid(): void {
    this.errorCells.clear();

    // Check all cells for violations
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const value = this.grid[row][col].value;
        if (value === null) continue;

        // Check if this cell is part of 3+ adjacent horizontally
        if (col <= this.gridSize - 3) {
          if (this.grid[row][col].value === value &&
              this.grid[row][col + 1].value === value &&
              this.grid[row][col + 2].value === value) {
            this.errorCells.add(`${row},${col}`);
            this.errorCells.add(`${row},${col + 1}`);
            this.errorCells.add(`${row},${col + 2}`);
          }
        }

        // Check if this cell is part of 3+ adjacent vertically
        if (row <= this.gridSize - 3) {
          if (this.grid[row][col].value === value &&
              this.grid[row + 1][col].value === value &&
              this.grid[row + 2][col].value === value) {
            this.errorCells.add(`${row},${col}`);
            this.errorCells.add(`${row + 1},${col}`);
            this.errorCells.add(`${row + 2},${col}`);
          }
        }
      }
    }

    // Check row counts
    for (let row = 0; row < this.gridSize; row++) {
      const sunCount = this.grid[row].filter(c => c.value === 'sun').length;
      const moonCount = this.grid[row].filter(c => c.value === 'moon').length;
      if (sunCount > this.gridSize / 2 || moonCount > this.gridSize / 2) {
        for (let col = 0; col < this.gridSize; col++) {
          if (this.grid[row][col].value !== null) {
            this.errorCells.add(`${row},${col}`);
          }
        }
      }
    }

    // Check column counts
    for (let col = 0; col < this.gridSize; col++) {
      const sunCount = this.grid.filter(r => r[col].value === 'sun').length;
      const moonCount = this.grid.filter(r => r[col].value === 'moon').length;
      if (sunCount > this.gridSize / 2 || moonCount > this.gridSize / 2) {
        for (let row = 0; row < this.gridSize; row++) {
          if (this.grid[row][col].value !== null) {
            this.errorCells.add(`${row},${col}`);
          }
        }
      }
    }
  }

  checkRulesForFixedCells(positions: { row: number; col: number; value: 'sun' | 'moon' }[], errors: Set<string>): void {
    // Check for 3+ adjacent horizontally
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col <= this.gridSize - 3; col++) {
        const val1 = this.grid[row][col].value;
        const val2 = this.grid[row][col + 1].value;
        const val3 = this.grid[row][col + 2].value;
        if (val1 !== null && val1 === val2 && val2 === val3) {
          errors.add(`${row},${col}`);
          errors.add(`${row},${col + 1}`);
          errors.add(`${row},${col + 2}`);
        }
      }
    }

    // Check for 3+ adjacent vertically
    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row <= this.gridSize - 3; row++) {
        const val1 = this.grid[row][col].value;
        const val2 = this.grid[row + 1][col].value;
        const val3 = this.grid[row + 2][col].value;
        if (val1 !== null && val1 === val2 && val2 === val3) {
          errors.add(`${row},${col}`);
          errors.add(`${row + 1},${col}`);
          errors.add(`${row + 2},${col}`);
        }
      }
    }

    // Check row counts (only fixed cells)
    for (let row = 0; row < this.gridSize; row++) {
      const sunCount = this.grid[row].filter(c => c.value === 'sun').length;
      const moonCount = this.grid[row].filter(c => c.value === 'moon').length;
      if (sunCount > this.gridSize / 2 || moonCount > this.gridSize / 2) {
        for (let col = 0; col < this.gridSize; col++) {
          if (this.grid[row][col].value !== null) {
            errors.add(`${row},${col}`);
          }
        }
      }
    }

    // Check column counts (only fixed cells)
    for (let col = 0; col < this.gridSize; col++) {
      const sunCount = this.grid.filter(r => r[col].value === 'sun').length;
      const moonCount = this.grid.filter(r => r[col].value === 'moon').length;
      if (sunCount > this.gridSize / 2 || moonCount > this.gridSize / 2) {
        for (let row = 0; row < this.gridSize; row++) {
          if (this.grid[row][col].value !== null) {
            errors.add(`${row},${col}`);
          }
        }
      }
    }
  }

  hasError(row: number, col: number): boolean {
    return this.errorCells.has(`${row},${col}`);
  }

  isGridComplete(): boolean {
    // Check all cells filled
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].value === null) return false;
      }
    }
    return true;
  }

  toggleSymbol(): void {
    this.selectedSymbol = this.selectedSymbol === 'sun' ? 'moon' : 'sun';
  }

  calculateScore(): void {
    const baseScore = 1000;
    const timeBonus = Math.max(0, 300 - this.timer);
    this.score = baseScore + timeBonus * 5;
  }

  saveGameHistory(): void {
    const history: GameHistory = {
      gameCode: 'TANGO',
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
    this.errorCells.clear();
    // Clear non-fixed cells only
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (!this.grid[row][col].isFixed) {
          this.grid[row][col].value = null;
        }
      }
    }
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

  getCellColor(value: 'sun' | 'moon' | null): string {
    if (value === 'sun') return '#FCD34D';
    if (value === 'moon') return '#60A5FA';
    return '#f3f4f6';
  }

  getSymbolDisplay(value: 'sun' | 'moon' | null): string {
    if (value === 'sun') return '☀️';
    if (value === 'moon') return '🌑';
    return '';
  }

  showHint(): void {
    // Find a good cell to suggest
    // Strategy: Find an empty cell where we can deduce the value
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].value === null && !this.grid[row][col].isFixed) {
          // Check if we can deduce the value for this cell
          const sunCount = this.grid[row].filter(c => c.value === 'sun').length;
          const moonCount = this.grid[row].filter(c => c.value === 'moon').length;
          
          // If row already has max suns or moons, we know what goes here
          if (sunCount >= this.gridSize / 2 || moonCount >= this.gridSize / 2) {
            this.hintCell = `${row},${col}`;
            setTimeout(() => {
              this.hintCell = null;
            }, 3000);
            return;
          }
          
          // Check if two adjacent cells have same value (can't place third)
          // Check horizontally
          if (col >= 2 && 
              this.grid[row][col - 1].value !== null &&
              this.grid[row][col - 1].value === this.grid[row][col - 2].value) {
            this.hintCell = `${row},${col}`;
            setTimeout(() => {
              this.hintCell = null;
            }, 3000);
            return;
          }
          
          if (col >= 1 && col < this.gridSize - 1 &&
              this.grid[row][col - 1].value !== null &&
              this.grid[row][col - 1].value === this.grid[row][col + 1].value) {
            this.hintCell = `${row},${col}`;
            setTimeout(() => {
              this.hintCell = null;
            }, 3000);
            return;
          }
          
          if (col < this.gridSize - 2 &&
              this.grid[row][col + 1].value !== null &&
              this.grid[row][col + 1].value === this.grid[row][col + 2].value) {
            this.hintCell = `${row},${col}`;
            setTimeout(() => {
              this.hintCell = null;
            }, 3000);
            return;
          }
        }
      }
    }
    
    // If no obvious hint found, just show first empty cell
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col].value === null && !this.grid[row][col].isFixed) {
          this.hintCell = `${row},${col}`;
          setTimeout(() => {
            this.hintCell = null;
          }, 3000);
          return;
        }
      }
    }
  }

  isHintCell(row: number, col: number): boolean {
    return this.hintCell === `${row},${col}`;
  }
}
