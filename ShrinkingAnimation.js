export class ShrinkingAnimation {
  constructor(x, y, drawFunction, options = {}) {
    this.x = x;
    this.y = y;
    this.scale = 1.0;
    this.drawFunction = drawFunction;
    this.shrinkSpeed = options.shrinkSpeed || 0.2;
    this.animationData = options.animationData || {};
  }

  update() {
    this.scale = Math.max(0, this.scale - this.shrinkSpeed);
    if (this.animationData.update) {
      this.animationData.update();
    }
  }

  isDone() {
    return this.scale <= 0;
  }

  draw(ctx, size) {
    const scaledSize = size * this.scale;
    const offset = (size - scaledSize) / 2;
    
    ctx.save();
    ctx.translate(this.x * size + offset, this.y * size + offset);
    ctx.scale(this.scale, this.scale);
    this.drawFunction(ctx, size, this.animationData);
    ctx.restore();
  }
} 