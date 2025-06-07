import { BOMB_IMAGE } from './utils.js';

export class Bomb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw(ctx, size) {
    if (BOMB_IMAGE.complete && BOMB_IMAGE.naturalWidth) {
      ctx.drawImage(BOMB_IMAGE, this.x * size, this.y * size, size, size);
    } else {
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(this.x * size + size/2, this.y * size + size/2, size/4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
} 