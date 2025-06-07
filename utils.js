// Utility to preload images from an array of sources
export function preloadImages(srcArray) {
  return srcArray.map(src => { const img = new Image(); img.src = src; return img; });
}

// Animation Frame Data
export const PLAYER_IDLE_FRAMES = preloadImages(Array.from({length: 12}, (_, i) => `img/Character-1/Idle_${i.toString().padStart(3, '0')}.png`));
export const ENEMY_IDLE_FRAMES = preloadImages(Array.from({length: 12}, (_, i) => `img/Character-2/Idle_${i.toString().padStart(3, '0')}.png`));
export const ENEMY_DIE_FRAMES = preloadImages(Array.from({length: 9}, (_, i) => `img/Character-2/Die_${(i+1).toString().padStart(3, '0')}.png`));

// Single Images
export const BOMB_IMAGE = new Image(); BOMB_IMAGE.src = 'img/bomb.png';
export const BACKGROUND_IMAGE = new Image(); BACKGROUND_IMAGE.src = 'img/background.png'; 