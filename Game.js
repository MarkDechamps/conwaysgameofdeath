import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Bomb } from './Bomb.js';
import { DyingEnemy } from './DyingEnemy.js';
import { ShrinkingEnemy } from './ShrinkingEnemy.js';

const BACKGROUND_IMAGE = new Image();
BACKGROUND_IMAGE.src = 'img/background.png';

export default class Game {
  constructor(gridSize = 16) {
    this.gridSize = gridSize;
    this.player = null;
    this.enemies = [];
    this.bombs = [];
    this.dyingEnemies = [];
    this.shrinkingEnemies = [];
    this.bullets = [];
    this.grid = this.createEmptyGrid();
    this._isGameOver = false;
    this.currentLevel = null;
    this.lastDirection = [1, 0]; // Default direction (right)
  }

  get isGameOver() {
    return this._isGameOver;
  }

  createEmptyGrid() {
    return Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
  }
  loadLevel(levelData) {
    this.grid = this.createEmptyGrid();
    this.enemies = [];
    this.bombs = [];
    this.dyingEnemies = [];
    this.shrinkingEnemies = [];
    this.player = null;
    this._isGameOver = false;
    this.currentLevel = levelData;
    const rows = levelData.trim().split('/');
    for (let y = 0; y < rows.length; y++) {
      let x = 0;
      for (const char of rows[y]) {
        if (char >= '1' && char <= '9') {
          x += parseInt(char);
        } else if (char === 'E') {
          this.enemies.push(new Enemy(x, y));
          this.grid[y][x] = 'E';
          x++;
        } else if (char === 'P') {
          this.player = new Player(x, y);
          this.grid[y][x] = 'P';
          x++;
        }
      }
    }
  }
  isInsideGrid(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }
  movePlayer(dx, dy) {
    if (!this.player || this._isGameOver) return;
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    if (!this.isInsideGrid(newX, newY)) return;
    
    // Check for collision with enemy
    const enemyIdx = this.enemies.findIndex(e => e.x === newX && e.y === newY);
    if (enemyIdx !== -1) {
      // Player dies when touching enemy
      this.grid[this.player.y][this.player.x] = null;
      this.player = null;
      this._isGameOver = true;
      return;
    }
    
    this.grid[this.player.y][this.player.x] = null;
    this.player.x = newX;
    this.player.y = newY;
    this.grid[newY][newX] = 'P';
    this.lastDirection = [dx, dy]; // Update last direction
  }
  placeBomb(dx, dy) {
    if (!this.player) return;
    const bx = this.player.x + dx;
    const by = this.player.y + dy;
    if (!this.isInsideGrid(bx, by)) return;
    if ((this.player.x === bx && this.player.y === by) || this.bombs.some(b => b.x === bx && b.y === by)) return;
    this.bombs.push(new Bomb(bx, by));
  }
  updateEnemies() {
    const nextGrid = this.createEmptyGrid();
    if (this.player) nextGrid[this.player.y][this.player.x] = 'P';
    const countEnemyNeighbors = (x, y) => {
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (this.isInsideGrid(nx, ny) && this.grid[ny][nx] === 'E') count++;
        }
      }
      return count;
    };
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const isEnemy = this.grid[y][x] === 'E';
        const neighbors = countEnemyNeighbors(x, y);
        if (isEnemy && (neighbors === 2 || neighbors === 3)) {
          nextGrid[y][x] = 'E';
        } else if (!isEnemy && neighbors === 3 && (!this.player || !(this.player.x === x && this.player.y === y))) {
          nextGrid[y][x] = 'E';
        }
      }
    }
    this.enemies = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (nextGrid[y][x] === 'E') {
          const bombIdx = this.bombs.findIndex(b => b.x === x && b.y === y);
          if (bombIdx !== -1) {
            this.bombs.splice(bombIdx, 1);
            nextGrid[y][x] = null;
            this.dyingEnemies.push(new DyingEnemy(x, y));
          } else {
            this.enemies.push(new Enemy(x, y));
          }
        }
      }
    }
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] === 'E' && nextGrid[y][x] !== 'E') {
          if (!this.dyingEnemies.some(d => d.x === x && d.y === y && !d.isDone())) {
            this.shrinkingEnemies.push(new ShrinkingEnemy(x, y));
          }
        }
      }
    }
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x] = nextGrid[y][x] || null;
      }
    }
  }
  updateAnimation() {
    if (this.player) this.player.updateAnimation();
    this.enemies.forEach(e => e.updateAnimation());
    this.dyingEnemies.forEach(d => d.updateAnimation());
    this.shrinkingEnemies.forEach(s => s.updateAnimation());
    this.dyingEnemies = this.dyingEnemies.filter(d => !d.isDone());
    this.shrinkingEnemies = this.shrinkingEnemies.filter(s => !s.isDone());
    this.randomlyGenerateEnemy();
    this.updateBullets();
  }
  randomlyGenerateEnemy() {
    if (this.enemies.length >= 10) return;
    const directions = [
      [1, 0], [0, 1], [-1, 0], [0, -1]
    ];
    const freeAdjacentCells = [];
    for (const enemy of this.enemies) {
      for (const [dx, dy] of directions) {
        const nx = enemy.x + dx;
        const ny = enemy.y + dy;
        if (this.isInsideGrid(nx, ny) && this.grid[ny][nx] === null) {
          freeAdjacentCells.push({ x: nx, y: ny });
        }
      }
    }
    if (freeAdjacentCells.length > 0) {
      const cell = freeAdjacentCells[Math.floor(Math.random() * freeAdjacentCells.length)];
      this.enemies.push(new Enemy(cell.x, cell.y));
      this.grid[cell.y][cell.x] = 'E';
    }
  }
  restart() {
    if (this.currentLevel) {
      this.loadLevel(this.currentLevel);
    }
  }
  draw(ctx, size) {
    if (BACKGROUND_IMAGE.complete && BACKGROUND_IMAGE.naturalWidth) {
      ctx.drawImage(BACKGROUND_IMAGE, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    this.dyingEnemies.forEach(d => d.draw(ctx, size));
    this.shrinkingEnemies.forEach(s => s.draw(ctx, size));
    this.enemies.forEach(e => e.draw(ctx, size));
    if (this.player) this.player.draw(ctx, size);
    this.bombs.forEach(b => b.draw(ctx, size));
    this.drawBullets(ctx, size);

    // Draw game over message
    if (this._isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', ctx.canvas.width/2, ctx.canvas.height/2 - 50);
      ctx.font = '24px Arial';
      ctx.fillText('Press R to Restart', ctx.canvas.width/2, ctx.canvas.height/2 + 50);
    }
  }

  drawBullets(ctx, size) {
    ctx.fillStyle = 'yellow';
    this.bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x * size + size / 2, bullet.y * size + size / 2, size / 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  shootBullet() {
    if (!this.player || this._isGameOver || this.bullets.length > 0) return;
    const [dx, dy] = this.lastDirection;
    const bullet = { x: this.player.x + dx, y: this.player.y + dy, dx, dy };
    this.bullets.push(bullet);
  }
  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.dx;
      bullet.y += bullet.dy;
      if (!this.isInsideGrid(bullet.x, bullet.y)) {
        this.bullets.splice(i, 1);
        continue;
      }
      const enemyIdx = this.enemies.findIndex(e => e.x === bullet.x && e.y === bullet.y);
      if (enemyIdx !== -1) {
        const enemy = this.enemies[enemyIdx];
        this.dyingEnemies.push(new DyingEnemy(enemy.x, enemy.y));
        this.enemies.splice(enemyIdx, 1);
        this.grid[bullet.y][bullet.x] = null;
        this.bullets.splice(i, 1);
      }
    }
  }
} 