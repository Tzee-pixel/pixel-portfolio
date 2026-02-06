import { Player } from './Player.js';
import { World } from './World.js';
import { InputHandler } from './InputHandler.js';
import backgroundImg from '../background.jpg';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.lastTime = 0;
        this.worldWidth = this.width; // World is now single screen
        this.camera = { x: 0, y: 0 };

        this.input = new InputHandler();
        this.world = new World(this);
        this.player = new Player(this);
        this.ui = null; // Will be set by main

        // Load background image
        this.bgImage = new Image();
        this.bgImage.src = backgroundImg;

        // Resize handling
        window.addEventListener('resize', () => {
            this.resize();
        });
        // Post-load resize check
        setTimeout(() => this.resize(), 100);
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
        } else {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        if (this.canvas.width === 0) this.canvas.width = 800;
        if (this.canvas.height === 0) this.canvas.height = 600;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.worldWidth = this.width; // Update world width to match screen

        // Update player size for responsive scaling
        if (this.player) {
            this.player.updateSize();
        }

        // Disable smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;
    }

    start() {
        this.gameLoop(0);
    }

    gameLoop(timeStamp) {
        try {
            const deltaTime = timeStamp - this.lastTime;
            this.lastTime = timeStamp;

            this.update(deltaTime);
            this.draw();

            requestAnimationFrame(this.gameLoop.bind(this));
        } catch (e) {
            console.error(e);
            this.ctx.fillStyle = 'red';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Game Error: ' + e.message, 50, 50);
            this.ctx.fillText('Check console for details', 50, 80);
        }
    }

    update(deltaTime) {
        this.world.update(deltaTime, this.input);
        this.player.update(this.input, deltaTime);

        // Camera logic removed for single screen view
        this.camera.x = 0;

        // Clear just-pressed keys at end of frame
        this.input.clearJustPressed();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background image with cover-style scaling (responsive)
        if (this.bgImage.complete && this.bgImage.naturalWidth > 0) {
            const imgAspect = this.bgImage.naturalWidth / this.bgImage.naturalHeight;
            const canvasAspect = this.width / this.height;

            let drawWidth, drawHeight, drawX, drawY;

            if (canvasAspect > imgAspect) {
                // Canvas is wider - fit to width
                drawWidth = this.width;
                drawHeight = this.width / imgAspect;
                drawX = 0;
                drawY = (this.height - drawHeight) / 2;
            } else {
                // Canvas is taller - fit to height
                drawHeight = this.height;
                drawWidth = this.height * imgAspect;
                drawX = (this.width - drawWidth) / 2;
                drawY = 0;
            }

            this.ctx.drawImage(this.bgImage, drawX, drawY, drawWidth, drawHeight);
        } else {
            // Fallback color while loading
            this.ctx.fillStyle = '#334455';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.world.draw(this.ctx);
        this.player.draw(this.ctx);
    }
}
