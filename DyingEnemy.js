import { ENEMY_DIE_FRAMES } from './utils.js';

export class DyingEnemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.frame = 0;
  }
  updateAnimation() {
    this.frame++;
  }
  isDone() {
    return this.frame >= ENEMY_DIE_FRAMES.length;
  }
  draw(ctx, size) {
    const img = ENEMY_DIE_FRAMES[this.frame] || ENEMY_DIE_FRAMES[ENEMY_DIE_FRAMES.length-1];
    if (img.complete && img.naturalWidth) {
      ctx.drawImage(img, this.x * size, this.y * size, size, size);
    }
  }
} 