export class InputHandler {
    constructor() {
        this.keys = [];
        this.justPressed = []; // Track keys that were just pressed this frame

        // Virtual button states (for on-screen controls)
        this.virtualButtons = {
            left: false,
            right: false,
            jump: false
        };

        window.addEventListener('keydown', e => {
            if ((e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'w' ||
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd' ||
                e.key === ' ' ||
                e.key === 'Enter' ||
                e.key === 'e' ||
                e.key === 'ArrowUp') && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
                this.justPressed.push(e.key); // Mark as just pressed
            }
            // Prevent default scrolling for arrows/space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) > -1) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === 'w' ||
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd' ||
                e.key === ' ' ||
                e.key === 'Enter' ||
                e.key === 'e') {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }

    // Call this at the end of each frame to clear just-pressed keys
    clearJustPressed() {
        this.justPressed = [];
    }

    // Check if a key was just pressed this frame
    wasJustPressed(key) {
        return this.justPressed.includes(key);
    }

    // Check if moving left (keyboard or virtual button)
    isMovingLeft() {
        return this.keys.includes('ArrowLeft') || this.keys.includes('a') || this.virtualButtons.left;
    }

    // Check if moving right (keyboard or virtual button)
    isMovingRight() {
        return this.keys.includes('ArrowRight') || this.keys.includes('d') || this.virtualButtons.right;
    }

    // Check if jumping (keyboard or virtual button)
    isJumping() {
        return this.keys.includes('ArrowUp') || this.keys.includes('w') || this.keys.includes(' ') || this.virtualButtons.jump;
    }
}
