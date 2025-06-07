import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Bomb } from './Bomb.js';
import { DyingEnemy } from './DyingEnemy.js';

const BACKGROUND_IMAGE = new Image();
BACKGROUND_IMAGE.src = 'img/background.png';

export default class Game {
  constructor(gridSize = 16) {
    this.gridSize = gridSize;
    this.player = null;
    this.enemies = [];
    this.bombs = [];
    this.dyingEnemies = [];
    this.grid = this.createEmptyGrid();
  }
  createEmptyGrid() {
    return Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
  }
  loadLevel(levelData) {
    this.grid = this.createEmptyGrid();
    this.enemies = [];
    this.bombs = [];
    this.dyingEnemies = [];
    this.player = null;
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
    if (!this.player) return;
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    if (!this.isInsideGrid(newX, newY)) return;
    const enemyIdx = this.enemies.findIndex(e => e.x === newX && e.y === newY);
    if (enemyIdx !== -1) {
      this.enemies.splice(enemyIdx, 1);
      this.dyingEnemies.push(new DyingEnemy(newX, newY));
    }
    this.grid[this.player.y][this.player.x] = null;
    this.player.x = newX;
    this.player.y = newY;
    this.grid[newY][newX] = 'P';
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
            this.dyingEnemies.push(new DyingEnemy(x, y));
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
    this.dyingEnemies = this.dyingEnemies.filter(d => !d.isDone());
  }
  draw(ctx, size) {
    if (BACKGROUND_IMAGE.complete && BACKGROUND_IMAGE.naturalWidth) {
      ctx.drawImage(BACKGROUND_IMAGE, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    this.dyingEnemies.forEach(d => d.draw(ctx, size));
    this.enemies.forEach(e => e.draw(ctx, size));
    if (this.player) this.player.draw(ctx, size);
    this.bombs.forEach(b => b.draw(ctx, size));
  }
} 