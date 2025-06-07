// Conway Shooter Game - Refactored OOP Version

import Game from './Game.js';
import { BACKGROUND_IMAGE } from './utils.js';

// --- Utility: Preload Images ---
function preloadImages(srcArray) {
  return srcArray.map(src => { const img = new Image(); img.src = src; return img; });
}

// --- Animation Frame Data ---
const PLAYER_IDLE_FRAMES = preloadImages(Array.from({length: 12}, (_, i) => `img/Character-1/Idle_${i.toString().padStart(3, '0')}.png`));
const ENEMY_IDLE_FRAMES = preloadImages(Array.from({length: 12}, (_, i) => `img/Character-2/Idle_${i.toString().padStart(3, '0')}.png`));
const ENEMY_DIE_FRAMES = preloadImages(Array.from({length: 9}, (_, i) => `img/Character-2/Die_${(i+1).toString().padStart(3, '0')}.png`));
const BOMB_IMAGE = new Image(); BOMB_IMAGE.src = 'img/bomb.png';

// Initialize game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelInput = document.getElementById('levelLoader');
const game = new Game(16);

function render() {
  const size = canvas.width / game.gridSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.draw(ctx, size);
}

// --- Animation/Game Loop ---
setInterval(() => {
  game.updateAnimation();
  render();
}, 100);

// --- Keyboard Controls ---
window.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowUp': game.movePlayer(0, -1); break;
    case 'ArrowDown': game.movePlayer(0, 1); break;
    case 'ArrowLeft': game.movePlayer(-1, 0); break;
    case 'ArrowRight': game.movePlayer(1, 0); break;
    case 'w': game.placeBomb(0, -1); break;
    case 's': game.placeBomb(0, 1); break;
    case 'a': game.placeBomb(-1, 0); break;
    case 'd': game.placeBomb(1, 0); break;
  }
  render();
});

// --- Enemy Update Loop ---
setInterval(() => {
  game.updateEnemies();
  render();
}, 1000);

// --- Level Loader ---
levelInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    console.log('File selected:', file.name);
    const levelData = await file.text();
    console.log('Level data:', levelData);
    game.loadLevel(levelData);
    render();
    levelInput.blur();
  }
});

// --- Load Default Level ---
console.log('Attempting to load default level...');
fetch('./levels/level1.fen')
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.text();
  })
  .then(levelData => {
    console.log('Level data loaded:', levelData);
    game.loadLevel(levelData);
    render();
  })
  .catch(error => {
    console.error('Error loading level:', error);
  });

// Initialize UI
window.addEventListener('DOMContentLoaded', () => {
  levelInput.blur();
}); 