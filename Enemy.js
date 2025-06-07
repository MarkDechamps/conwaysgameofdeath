import { ENEMY_IDLE_FRAMES } from './utils.js';

export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.animFrame = 0;
  }
  updateAnimation() {
    this.animFrame = (this.animFrame + 1) % ENEMY_IDLE_FRAMES.length;
  }
  draw(ctx, size) {
    const img = ENEMY_IDLE_FRAMES[this.animFrame];
    if (img.complete && img.naturalWidth) {
      ctx.drawImage(img, this.x * size, this.y * size, size, size);
    } else {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(this.x * size + size/2, this.y * size + size/2, size/3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
} 