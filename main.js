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

// --- Mouse Controls ---
let mouseX = 0;
let mouseY = 0;

// Track mouse position for movement indicators
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  render();
});

canvas.addEventListener('click', (e) => {
  if (game.isGameOver) return;

  const rect = canvas.getBoundingClientRect();
  const cellSize = canvas.width / game.gridSize;
  
  // Get click position relative to canvas
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Get player's center position
  const playerCenterX = (game.player.x + 0.5) * cellSize;
  const playerCenterY = (game.player.y + 0.5) * cellSize;
  
  // Calculate angle between player and click point
  const deltaX = clickX - playerCenterX;
  const deltaY = clickY - playerCenterY;
  const angle = Math.atan2(deltaY, deltaX);
  
  // Convert angle to direction (0 = right, 1 = down, 2 = left, 3 = up)
  const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
  const direction = Math.round(normalizedAngle / (Math.PI / 2)) % 4;
  
  // Map direction to dx, dy
  const directions = [
    [1, 0],   // right
    [0, 1],   // down
    [-1, 0],  // left
    [0, -1]   // up
  ];
  
  const [dx, dy] = directions[direction];
  game.movePlayer(dx, dy);
  render();
});

// --- Keyboard Controls ---
window.addEventListener('keydown', (e) => {
  if (game.isGameOver) {
    if (e.key.toLowerCase() === 'r') {
      game.restart();
      render();
    }
    return;
  }

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

// --- Animation/Game Loop ---
setInterval(() => {
  game.updateAnimation();
  render();
}, 100);

// Update the render function to include movement indicators
function render() {
  const size = canvas.width / game.gridSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the game state
  game.draw(ctx, size);
  
  // Draw movement indicators if game is not over
  if (!game.isGameOver && game.player) {
    const cellSize = canvas.width / game.gridSize;
    const playerCenterX = (game.player.x + 0.5) * cellSize;
    const playerCenterY = (game.player.y + 0.5) * cellSize;
    
    // Calculate angle between player and mouse
    const deltaX = mouseX - playerCenterX;
    const deltaY = mouseY - playerCenterY;
    const angle = Math.atan2(deltaY, deltaX);
    const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
    const direction = Math.round(normalizedAngle / (Math.PI / 2)) % 4;
    
    // Draw indicators for all four directions
    const directions = [
      { dx: 1, dy: 0 },   // right
      { dx: 0, dy: 1 },   // down
      { dx: -1, dy: 0 },  // left
      { dx: 0, dy: -1 }   // up
    ];
    
    directions.forEach((dir, index) => {
      const x = (game.player.x + dir.dx + 0.5) * cellSize;
      const y = (game.player.y + dir.dy + 0.5) * cellSize;
      
      // Draw circle with different opacity based on mouse direction
      ctx.beginPath();
      ctx.arc(x, y, cellSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${index === direction ? 0.8 : 0.3})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${index === direction ? 1 : 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
} 