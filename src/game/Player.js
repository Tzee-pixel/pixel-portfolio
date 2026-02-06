import runGif from '../me-run1.gif';
import jumpGif from '../me-jump1.gif';
import idlePng from '../standing.png';

export class Player {
    constructor(game) {
        this.game = game;

        // Responsive player size based on screen
        this.updateSize();

        this.x = 100;
        this.y = 100;
        this.speedX = 0;
        this.speedY = 0;
        this.maxSpeed = 5;
        this.jumpForce = 32;
        this.weight = 1; // Gravity
        this.grounded = false;

        this.facingRight = true;
        this.currentState = 'idle'; // Track state for animation reset

        // CONTAINER CLEANUP: Robust removal of old instances
        const existingWrapper = document.getElementById('player-wrapper');
        if (existingWrapper) {
            existingWrapper.remove();
        }

        // Create Container for all player sprites
        this.container = document.createElement('div');
        this.container.id = 'player-wrapper';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none'; // Passthrough clicks
        this.container.style.zIndex = '10';

        // Create DOM Elements for GIF support

        // Idle Element
        this.idleElement = document.createElement('img');
        this.idleElement.src = idlePng;
        this.idleElement.style.position = 'absolute';
        this.idleElement.style.display = 'block'; // Default start

        // Run Element
        this.runElement = document.createElement('img');
        this.runElement.src = runGif;
        this.runElement.style.position = 'absolute';
        this.runElement.style.display = 'none';

        // Jump Element
        this.jumpElement = document.createElement('img');
        this.jumpElement.src = jumpGif;
        this.jumpElement.style.position = 'absolute';
        this.jumpElement.style.display = 'none';

        // Shadow Element
        this.shadowElement = document.createElement('div');
        this.shadowElement.style.position = 'absolute';
        this.shadowElement.style.width = '100px';
        this.shadowElement.style.height = '10px';
        this.shadowElement.style.background = 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 40%)';
        this.shadowElement.style.borderRadius = '50%';
        this.shadowElement.style.display = 'block';

        // Append to container (shadow first so it's behind)
        this.container.appendChild(this.shadowElement);
        this.container.appendChild(this.idleElement);
        this.container.appendChild(this.runElement);
        this.container.appendChild(this.jumpElement);

        // Append container to game DOM
        const gameContainer = this.game.canvas.parentElement || document.body;
        gameContainer.appendChild(this.container);
    }

    updateSize() {
        // Calculate responsive size based on screen dimensions
        const screenWidth = this.game.width || 800;
        const isMobile = screenWidth < 500;
        const isTablet = screenWidth >= 500 && screenWidth < 800;

        const baseSize = 128;
        const scale = isMobile ? 0.6 : (isTablet ? 0.8 : 1);

        this.width = Math.round(baseSize * scale);
        this.height = Math.round(baseSize * scale);
    }

    update(input, deltaTime) {
        // Horizontal Movement - now supports both keyboard and virtual buttons
        if (input.isMovingRight()) {
            this.speedX = this.maxSpeed;
            this.facingRight = true;
        } else if (input.isMovingLeft()) {
            this.speedX = -this.maxSpeed;
            this.facingRight = false;
        } else {
            this.speedX = 0;
        }

        this.x += this.speedX;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.worldWidth - this.width) this.x = this.game.worldWidth - this.width;

        // Jumping - now supports both keyboard and virtual buttons
        if (input.isJumping() && this.grounded) {
            this.speedY -= this.jumpForce;
        }

        // Vertical Physics
        this.y += this.speedY;

        if (!this.grounded) {
            this.speedY += this.weight;
        }

        // Ground Collision (Simple floor detection)
        // We assume the floor is at game.height - 50 (based on World.js)
        const groundLevel = this.game.height - 50;

        if (this.y >= groundLevel - this.height - 5) { // Added 5px buffer
            this.y = groundLevel - this.height;
            this.speedY = 0;
            this.grounded = true;
        } else {
            this.grounded = false;
        }
    }

    draw(ctx) {
        // Determine active element and state
        let activeEl;
        let newState;

        if (!this.grounded) {
            activeEl = this.jumpElement;
            newState = 'jump';
        } else if (Math.abs(this.speedX) > 0.1) {
            activeEl = this.runElement;
            newState = 'run';
        } else {
            activeEl = this.idleElement;
            newState = 'idle';
        }

        // Track state change (for future use)
        if (this.currentState !== newState) {
            this.currentState = newState;
        }

        // Simple visibility toggle - GIFs play continuously
        this.idleElement.style.display = (activeEl === this.idleElement) ? 'block' : 'none';
        this.runElement.style.display = (activeEl === this.runElement) ? 'block' : 'none';
        this.jumpElement.style.display = (activeEl === this.jumpElement) ? 'block' : 'none';

        // Calculate screen position
        const screenX = this.x - this.game.camera.x;
        const screenY = this.y;

        // Update Position & Transform for Active Element
        activeEl.style.left = `${screenX}px`;
        activeEl.style.top = `${screenY}px`;
        activeEl.style.width = `${this.width}px`;
        activeEl.style.height = `${this.height}px`;

        if (!this.facingRight) {
            activeEl.style.transform = 'scaleX(-1)';
        } else {
            activeEl.style.transform = 'scaleX(1)';
        }

        // Update Shadow position and visibility
        const groundLevel = this.game.height - 50;
        const shadowX = screenX + (this.width / 2) - 50; // Center shadow under character
        const shadowY = groundLevel - 10; // Just above ground level

        this.shadowElement.style.left = `${shadowX}px`;
        this.shadowElement.style.top = `${shadowY}px`;

        // Show shadow when grounded, shrink when jumping
        if (this.grounded) {
            this.shadowElement.style.display = 'block';
            this.shadowElement.style.opacity = '1';
            this.shadowElement.style.transform = 'scale(1)';
        } else {
            // Shrink shadow based on height (further from ground = smaller shadow)
            const distFromGround = groundLevel - this.height - this.y;
            const scale = Math.max(0.3, 1 - (distFromGround / 200));
            this.shadowElement.style.display = 'block';
            this.shadowElement.style.opacity = `${scale}`;
            this.shadowElement.style.transform = `scale(${scale})`;
        }
    }
}
