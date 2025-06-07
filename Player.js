import { PLAYER_IDLE_FRAMES } from './utils.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.animFrame = 0;
  }
  updateAnimation() {
    this.animFrame = (this.animFrame + 1) % PLAYER_IDLE_FRAMES.length;
  }
  draw(ctx, size) {
    const img = PLAYER_IDLE_FRAMES[this.animFrame];
    if (img.complete && img.naturalWidth) {
      ctx.drawImage(img, this.x * size, this.y * size, size, size);
    } else {
      ctx.fillStyle = 'lime';
      ctx.fillRect(this.x * size + size/4, this.y * size + size/4, size/2, size/2);
    }
  }
} 