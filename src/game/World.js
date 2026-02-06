export class World {
    constructor(game) {
        this.game = game;
        // Ground is implicit at game.height - 50 for now, but we can add platforms
        this.platforms = [
            { x: 300, y: 300, width: 200, height: 20 },
            { x: 600, y: 400, width: 150, height: 20 },
            { x: 50, y: 350, width: 100, height: 20 }
        ];

        const groundY = this.game.height - 50; // Initial estimate

        // Define trigger types
        const triggerTypes = [
            { label: { en: 'About Me 🙋🏻‍♀️', jp: '自己紹介 🙋🏻‍♀️' }, type: 'about' },
            { label: { en: 'Skills & Experience 🎨', jp: 'スキル・経験 🎨' }, type: 'skills' },
            { label: { en: "What I'd Like to Improve on 🛠️", jp: '今後伸ばしていきたいこと 🛠️' }, type: 'improve' },
            { label: { en: 'What Makes the Best Me 🌟', jp: '自分の強みを発揮できる環境 🌟' }, type: 'bestme' },
            { label: { en: 'Other Tidbits 💭', jp: 'その他・ちょっとしたこと 💭' }, type: 'tidbits' }
        ];

        // Fixed layout configuration
        // indices: 0: about, 1: skills, 2: improve, 3: bestme, 4: tidbits
        const layoutConfig = [
            { xFactor: 0.20, yFactor: 0.6 }, // About
            { xFactor: 0.60, yFactor: 0.7 }, // Skills
            { xFactor: 0.15, yFactor: 0.5 }, // Improve (Left side as requested)
            { xFactor: 0.70, yFactor: 0.56 }, // BestMe
            { xFactor: 0.35, yFactor: 0.4 }  // Tidbits
        ];

        this.triggers = triggerTypes.map((t, i) => {
            const config = layoutConfig[i];
            return {
                ...t,
                width: 40,
                height: 40,
                xFactor: config.xFactor,
                yFactor: config.yFactor,
                // Movement properties - Constant for predictability
                moveSpeed: 0.5,
                moveAmp: 60,
                movePhase: i * (Math.PI / 2) // Staggered phase
            };
        });

        // Control button hitboxes (will be updated in draw)
        this.controlButtons = {
            left: { x: 0, y: 0, width: 0, height: 0 },
            jump: { x: 0, y: 0, width: 0, height: 0 },
            right: { x: 0, y: 0, width: 0, height: 0 }
        };

        // Set up mouse/touch events for control buttons
        this.setupControlEvents();
    }

    setupControlEvents() {
        const canvas = this.game.canvas;

        // Helper to get position relative to canvas
        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            if (e.touches) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            }
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        // Check which button is at position
        const getButtonAt = (pos) => {
            for (const [name, btn] of Object.entries(this.controlButtons)) {
                if (pos.x >= btn.x && pos.x <= btn.x + btn.width &&
                    pos.y >= btn.y && pos.y <= btn.y + btn.height) {
                    return name;
                }
            }
            return null;
        };

        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            const pos = getPos(e);
            const button = getButtonAt(pos);
            if (button && this.game.input) {
                this.game.input.virtualButtons[button] = true;
            }
        });

        canvas.addEventListener('mouseup', () => {
            if (this.game.input) {
                this.game.input.virtualButtons.left = false;
                this.game.input.virtualButtons.right = false;
                this.game.input.virtualButtons.jump = false;
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if (this.game.input) {
                this.game.input.virtualButtons.left = false;
                this.game.input.virtualButtons.right = false;
                this.game.input.virtualButtons.jump = false;
            }
        });

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const pos = getPos(e);
            const button = getButtonAt(pos);
            if (button && this.game.input) {
                this.game.input.virtualButtons[button] = true;
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.game.input) {
                this.game.input.virtualButtons.left = false;
                this.game.input.virtualButtons.right = false;
                this.game.input.virtualButtons.jump = false;
            }
        }, { passive: false });

        canvas.addEventListener('touchcancel', () => {
            if (this.game.input) {
                this.game.input.virtualButtons.left = false;
                this.game.input.virtualButtons.right = false;
                this.game.input.virtualButtons.jump = false;
            }
        });
    }

    drawStyledButton(ctx, x, y, width, height, text, bgColor, shadowColor, textColor, fontSize = 11) {
        const radius = 6;
        const shadowOffset = 3;

        // Draw shadow
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.roundRect(x, y + shadowOffset, width, height, radius);
        ctx.fill();

        // Draw button
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();

        // Draw text
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
        ctx.textBaseline = 'alphabetic';
    }

    update(deltaTime, input) {
        // Simple AABB Collision
        const player = this.game.player;
        const time = Date.now() / 1000; // Time in seconds

        this.currentOverlapTrigger = null; // Track which trigger player is touching

        this.triggers.forEach(trigger => {
            // Update base position based on screen factors
            const baseX = this.game.width * trigger.xFactor;
            trigger.y = this.game.height * trigger.yFactor;

            // Calculate dynamic position
            const floatX = Math.cos(time * trigger.moveSpeed + trigger.movePhase) * trigger.moveAmp;

            // Constrain to screen bounds logic could go here, but random placement already buffers

            const currentX = baseX + floatX;
            trigger.currentX = currentX; // Store for draw
            const currentY = trigger.y;

            // Check for overlap using dynamic position
            if (player.x < currentX + trigger.width &&
                player.x + player.width > currentX &&
                player.y < currentY + trigger.height &&
                player.y + player.height > currentY) {

                // Player is touching this trigger - store it
                this.currentOverlapTrigger = trigger;
            }
        });

        // Only open dialogue when player JUMPS into a trigger (moving upward, not falling)
        if (this.currentOverlapTrigger) {
            // speedY < 0 means player is moving upward (jumping)
            // This prevents triggering when falling from above at game start
            // Also check that this trigger hasn't been recently triggered (cooldown)
            const now = Date.now();
            const cooldownMs = 1000; // 1 second cooldown per trigger

            if (player.speedY < 0 && (!this.currentOverlapTrigger.lastTriggered || now - this.currentOverlapTrigger.lastTriggered > cooldownMs)) {
                if (this.game.ui) {
                    const dialogueOpened = this.game.ui.showDialogue(this.currentOverlapTrigger.type);
                    if (dialogueOpened) {
                        this.currentOverlapTrigger.opened = true; // Only mark as opened if dialogue actually opened
                    }
                    this.currentOverlapTrigger.lastTriggered = now; // Set cooldown
                }
            }
        }
    }

    draw(ctx) {
        const groundY = this.game.height - 50;

        // Ground drawing removed - using background image instead
        // Platform drawing removed as unused

        // Draw styled instruction panel at top - RESPONSIVE
        const currentLang = this.game.ui ? this.game.ui.currentLanguage : 'en';

        // Calculate responsive sizes based on screen width
        const screenWidth = this.game.width;
        const isMobile = screenWidth < 500;
        const isTablet = screenWidth >= 500 && screenWidth < 800;

        // Scale factor based on screen size
        const scale = isMobile ? 0.7 : (isTablet ? 0.85 : 1);

        // Panel dimensions - responsive
        const panelWidth = Math.min(420 * scale, screenWidth - 20);
        const panelHeight = isMobile ? 80 : 70;
        const panelX = (screenWidth - panelWidth) / 2;
        const panelY = 10;

        // Draw panel background with subtle border
        ctx.fillStyle = 'rgba(255, 248, 220, 0.95)';
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 180, 140, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Button dimensions - responsive
        const buttonY = panelY + (isMobile ? 10 : 12);
        const buttonHeight = Math.round(28 * scale);
        const buttonGap = Math.round(8 * scale);
        const moveButtonWidth = Math.round(70 * scale);
        const jumpButtonWidth = Math.round(90 * scale);
        const buttonFontSize = isMobile ? 9 : 11;

        const totalButtonsWidth = moveButtonWidth * 2 + jumpButtonWidth + buttonGap * 2;
        const buttonsStartX = (screenWidth - totalButtonsWidth) / 2;

        // Store button positions for click detection
        const leftBtnX = buttonsStartX;
        const jumpBtnX = buttonsStartX + moveButtonWidth + buttonGap;
        const rightBtnX = buttonsStartX + moveButtonWidth + jumpButtonWidth + buttonGap * 2;

        this.controlButtons.left = { x: leftBtnX, y: buttonY, width: moveButtonWidth, height: buttonHeight };
        this.controlButtons.jump = { x: jumpBtnX, y: buttonY, width: jumpButtonWidth, height: buttonHeight };
        this.controlButtons.right = { x: rightBtnX, y: buttonY, width: moveButtonWidth, height: buttonHeight };

        // Left MOVE button (dark)
        this.drawStyledButton(ctx, leftBtnX, buttonY, moveButtonWidth, buttonHeight,
            currentLang === 'jp' ? '← 移動' : '← MOVE', '#2d2d2d', '#1a1a1a', 'white', buttonFontSize);

        // JUMP UP button (green)
        this.drawStyledButton(ctx, jumpBtnX, buttonY, jumpButtonWidth, buttonHeight,
            currentLang === 'jp' ? '🚀 ジャンプ!' : '🚀 JUMP UP!', '#4ade80', '#22c55e', '#1a1a1a', buttonFontSize);

        // Right MOVE button (dark)
        this.drawStyledButton(ctx, rightBtnX, buttonY, moveButtonWidth, buttonHeight,
            currentLang === 'jp' ? '移動 →' : 'MOVE →', '#2d2d2d', '#1a1a1a', 'white', buttonFontSize);

        // Instruction text at bottom - responsive
        const instructionFontSize = isMobile ? 8 : 10;
        const instructionText = currentLang === 'jp'
            ? (isMobile ? 'A/← • D/→ • SPACE • ESC' : 'Use: A/← (左) • D/→ (右) • SPACE (ジャンプ) • ESC (閉じる)')
            : (isMobile ? 'A/← • D/→ • SPACE • ESC' : 'Use: Hold A/← (Left) • Hold D/→ (Right) • SPACE (Jump) • ESC (Close)');
        ctx.font = `${instructionFontSize}px Arial, sans-serif`;
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText(instructionText, screenWidth / 2, panelY + panelHeight - (isMobile ? 8 : 10));

        // Draw Triggers - dynamically positioned above ground - RESPONSIVE
        const triggerFontSize = isMobile ? 12 : (isTablet ? 14 : 16);
        ctx.font = `bold ${triggerFontSize}px Courier New`;
        ctx.textAlign = 'center';

        const time = Date.now() / 1000;

        // Responsive trigger scale
        const triggerScale = isMobile ? 0.7 : (isTablet ? 0.85 : 1);
        // Reduce float amplitude on mobile
        const floatAmpMultiplier = isMobile ? 0.4 : (isTablet ? 0.7 : 1);

        this.triggers.forEach(trigger => {
            // Ensure position is updated (use stored currentX if available, or calc)
            // We recalculate here just to be safe for rendering smoothness independent of fixed update tick if any
            const baseX = this.game.width * trigger.xFactor;
            trigger.y = this.game.height * trigger.yFactor;

            // Get current language from UI, default to English
            const currentLang = this.game.ui ? this.game.ui.currentLanguage : 'en';
            // trigger.label is now an object { en: '...', jp: '...' }
            const labelText = trigger.label[currentLang] || trigger.label['en'];

            // Calculate dynamic width based on text - responsive
            const textMetrics = ctx.measureText(labelText);
            const padding = Math.round(30 * triggerScale);
            trigger.width = textMetrics.width + padding;
            trigger.height = Math.round(40 * triggerScale);

            // Apply horizontal float - reduced on mobile
            const floatX = Math.cos(time * trigger.moveSpeed + trigger.movePhase) * (trigger.moveAmp * floatAmpMultiplier);

            const drawX = (baseX + floatX) - this.game.camera.x;

            // Floating animation effect
            const floatY = Math.sin(Date.now() / 500) * 5;

            // Draw rounded rectangle with game button style
            const radius = 4; // Corner radius
            const shadowOffset = 4; // Shadow depth for 3D effect

            // Colors based on opened state
            const shadowColor = trigger.opened ? '#1a5c1a' : '#333333';
            const fillColor = trigger.opened ? '#4ade80' : 'white';
            const borderColor = trigger.opened ? '#166534' : 'black';

            // Draw shadow (darker bottom layer for 3D effect)
            ctx.fillStyle = shadowColor;
            ctx.beginPath();
            ctx.roundRect(drawX + shadowOffset, trigger.y + floatY + shadowOffset, trigger.width, trigger.height, radius);
            ctx.fill();

            // Draw main button
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.roundRect(drawX, trigger.y + floatY, trigger.width, trigger.height, radius);
            ctx.fill();

            // Draw thick border
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = 'black'; // Text color inside box
            ctx.textBaseline = 'middle';
            // Draw text centered in the box
            ctx.fillText(labelText, drawX + trigger.width / 2, trigger.y + floatY + trigger.height / 2);
            ctx.textBaseline = 'alphabetic'; // Reset baseline
        });
    }
}
