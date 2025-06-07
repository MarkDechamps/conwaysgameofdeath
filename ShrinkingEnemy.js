import { ENEMY_IDLE_FRAMES } from './utils.js';
import { ShrinkingAnimation } from './ShrinkingAnimation.js';

export class ShrinkingEnemy {
  constructor(x, y) {
    this.animation = new ShrinkingAnimation(x, y, this.drawEnemy, {
      shrinkSpeed: 0.2,
      animationData: {
        animFrame: 0,
        update: () => {
          this.animation.animationData.animFrame = 
            (this.animation.animationData.animFrame + 1) % ENEMY_IDLE_FRAMES.length;
        }
      }
    });
  }

  updateAnimation() {
    this.animation.update();
  }

  isDone() {
    return this.animation.isDone();
  }

  draw(ctx, size) {
    this.animation.draw(ctx, size);
  }

  drawEnemy(ctx, size, data) {
    const img = ENEMY_IDLE_FRAMES[data.animFrame];
    if (img.complete && img.naturalWidth) {
      ctx.drawImage(img, 0, 0, size, size);
    } else {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
} 