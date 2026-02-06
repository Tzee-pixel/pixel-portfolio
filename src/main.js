import { Game } from './game/Game.js';
import { UIManager } from './ui/UIManager.js';
import './style.css';

window.addEventListener('load', () => {
  const game = new Game('game-canvas');
  const ui = new UIManager(game);
  game.ui = ui; // Circular reference for logic if needed, or pass via update loop

  // For now, just start everything to verify it works
  game.resize();
  game.start();
  ui.showLanguageSelection();
});
