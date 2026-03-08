// Main Game Engine
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.state = GAME_STATES.MENU;
        this.currentChapter = 1;
        
        this.player = null;
        this.currentLevel = null;
        this.camera = { x: 0, y: 0 };
        
        this.input = new InputHandler();
        this.audio = new AudioManager();
        
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.dialogQueue = [];
        this.currentDialog = null;
        this.dialogTimer = 0;
        
        this.inventory = [];
        this.paused = false;
        this.gameOver = false;
        this.victory = false;
        
        this.deaths = 0;
        this.startTime = 0;
        this.playTime = 0;
        
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
    }
    
    init() {
        console.log('Initializing The Forgotten Playroom...');
        
        // Set up event listeners
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Initialize audio context on first interaction
        document.addEventListener('click', () => {
            if (this.audio.sfxVolume > 0) {
                // Enable audio
            }
        }, { once: true });
        
        this.resize();
        this.showMenu();
        this.gameLoop();
    }
    
    resize() {
        this.canvas.width = window.innerWidth || 800;
        this.canvas.height = window.innerHeight || 600;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    handleVisibilityChange() {
        if (document.hidden && this.state === GAME_STATES.PLAYING) {
            this.pause();
        }
    }
    
    showMenu() {
        this.state = GAME_STATES.MENU;
        document.getElementById('main-menu').classList.remove('hidden');
    }
    
    startNewGame() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.add('hidden');
        
        this.currentChapter = 1;
        this.deaths = 0;
        this.startTime = Date.now();
        this.gameOver = false;
        this.victory = false;
        this.inventory = [];
        
        this.loadChapter(1);
        this.state = GAME_STATES.PLAYING;
    }
    
    loadChapter(chapterNum) {
        this.currentChapter = chapterNum;
        
        // Create level based on chapter
        switch (chapterNum) {
            case 1:
                this.currentLevel = new Chapter1();
                break;
            case 2:
                this.currentLevel = new Chapter2();
                break;
            case 3:
                this.currentLevel = new Chapter3();
                break;
            case 4:
                this.currentLevel = new Chapter4();
                break;
            default:
                this.currentLevel = new Chapter1();
        }
        
        // Generate level
        const tileData = this.currentLevel.generate();
        this.currentLevel.load(tileData);
        
        // Create player at spawn
        this.player = new Player(
            this.currentLevel.playerSpawn.x,
            this.currentLevel.playerSpawn.y
        );
        
        // Create enemies
        this.currentLevel.enemies = this.currentLevel.createEnemies();
        
        // Create allies
        this.currentLevel.allies = this.currentLevel.createAllies ? this.currentLevel.createAllies() : [];
        
        // Set dialogs
        this.dialogQueue = this.currentLevel.getDialogs ? [...this.currentLevel.getDialogs()] : [];
        this.currentDialog = null;
        this.dialogTimer = 0;
        
        // Update HUD
        this.updateHUD();
        
        // Show chapter title
        this.showChapterTitle();
    }
    
    showChapterTitle() {
        const title = `Capítulo ${this.currentChapter}`;
        const subtitle = this.currentLevel.name;
        
        document.getElementById('chapter-title').textContent = title;
        document.getElementById('chapter-subtitle').textContent = subtitle;
        
        const chapterScreen = document.getElementById('chapter-screen');
        chapterScreen.classList.remove('hidden');
        
        setTimeout(() => {
            chapterScreen.classList.add('hidden');
        }, 3000);
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // FPS counter
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
        
        if (!this.paused) {
            switch (this.state) {
                case GAME_STATES.MENU:
                    this.updateMenu();
                    break;
                case GAME_STATES.PLAYING:
                    this.update(this.deltaTime);
                    break;
                case GAME_STATES.PAUSED:
                    break;
                case GAME_STATES.GAME_OVER:
                    break;
                case GAME_STATES.VICTORY:
                    break;
            }
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    updateMenu() {
        // Menu animations handled by CSS
    }
    
    update(deltaTime) {
        if (this.gameOver || this.victory) return;
        
        // Handle dialogs
        if (this.dialogQueue.length > 0 || this.currentDialog) {
            this.updateDialogs(deltaTime);
        }
        
        // Update player
        this.player.update(deltaTime, this.input, this.currentLevel.tiles, GAME_CONFIG.TILE_SIZE);
        
        // Check flashlight
        if (this.player.flashlightBattery <= 0) {
            // Player in darkness - danger!
        }
        
        // Update camera
        this.updateCamera();
        
        // Update level and enemies
        this.currentLevel.update(deltaTime, this.player, this.audio);
        
        // Check collisions
        const collision = this.currentLevel.checkCollisions(this.player, this.audio);
        
        if (collision === 'end') {
            // Reached end of chapter
            this.nextChapter();
        } else if (collision && collision.isAlive) {
            // Enemy collision - but we already handle damage in enemy update
        }
        
        // Check game over
        if (!this.player.isAlive) {
            this.triggerGameOver();
        }
        
        // Check victory (Chapter 4 only)
        if (this.currentChapter === 4 && this.currentLevel.checkVictory && this.currentLevel.checkVictory()) {
            this.triggerVictory();
        }
        
        // Update HUD
        this.updateHUD();
        
        // Handle pause
        if (this.input.wasKeyJustPress(KEYS.ESC)) {
            this.pause();
        }
        
        // Handle interaction
        if (this.input.wasKeyJustPress(KEYS.E) && this.player.canInteract) {
            this.handleInteraction();
        }
    }
    
    updateDialogs(deltaTime) {
        if (!this.currentDialog && this.dialogQueue.length > 0) {
            this.currentDialog = this.dialogQueue.shift();
            this.dialogTimer = DIALOG_DURATION;
        }
        
        if (this.currentDialog) {
            this.dialogTimer -= deltaTime;
            
            if (this.input.wasKeyJustPress(KEYS.E) || this.input.wasKeyJustPress(KEYS.SPACE)) {
                this.currentDialog = null;
            }
            
            if (this.dialogTimer <= 0) {
                this.currentDialog = null;
            }
        }
    }
    
    updateCamera() {
        // Center camera on player
        const targetX = this.player.x - this.width / 2;
        const targetY = this.player.y - this.height / 2;
        
        // Smooth camera
        this.camera.x += (targetX - this.camera.x) * 0.1;
        this.camera.y += (targetY - this.camera.y) * 0.1;
        
        // Clamp camera to level bounds
        const maxX = this.currentLevel.width * GAME_CONFIG.TILE_SIZE - this.width;
        const maxY = this.currentLevel.height * GAME_CONFIG.TILE_SIZE - this.height;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }
    
    handleInteraction() {
        // Interact with doors, items, etc.
        const interacted = this.player.interact(this.currentLevel.tiles, GAME_CONFIG.TILE_SIZE);
        
        if (interacted) {
            this.audio.play('pickup');
        }
    }
    
    pause() {
        this.paused = !this.paused;
        this.state = this.paused ? GAME_STATES.PAUSED : GAME_STATES.PLAYING;
        
        const pauseMenu = document.getElementById('pause-menu');
        if (this.paused) {
            pauseMenu.classList.remove('hidden');
        } else {
            pauseMenu.classList.add('hidden');
        }
    }
    
    nextChapter() {
        this.currentChapter++;
        
        if (this.currentChapter > 4) {
            // Game complete!
            this.triggerVictory();
            return;
        }
        
        // Save progress
        this.inventory = [...this.player.inventory];
        
        // Load next chapter
        this.loadChapter(this.currentChapter);
    }
    
    triggerGameOver() {
        this.gameOver = true;
        this.deaths++;
        
        const deathMessage = this.getDeathMessage();
        document.getElementById('death-monster').textContent = deathMessage.monster;
        document.getElementById('death-message').textContent = deathMessage.message;
        document.getElementById('death-count').textContent = this.deaths;
        
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        this.audio.play('death');
        this.state = GAME_STATES.GAME_OVER;
    }
    
    getDeathMessage() {
        // Find which enemy killed player
        for (const enemy of this.currentLevel.enemies) {
            const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < 50) {
                return this.currentLevel.getDeathMessage(enemy.type);
            }
        }
        
        return { 
            message: "Has sido atrapado por la oscuridad...", 
            monster: "Algo te encontró en las sombras" 
        };
    }
    
    triggerVictory() {
        this.victory = true;
        this.playTime = Date.now() - this.startTime;
        
        const minutes = Math.floor(this.playTime / 60000);
        const seconds = Math.floor((this.playTime % 60000) / 1000);
        
        document.getElementById('victory-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('victory-deaths').textContent = this.deaths;
        
        document.getElementById('victory-screen').classList.remove('hidden');
        
        this.audio.play('victory');
        this.state = GAME_STATES.VICTORY;
    }
    
    updateHUD() {
        // Health
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-bar').style.width = `${healthPercent}%`;
        document.getElementById('health-text').textContent = `${Math.floor(this.player.health)}/${this.player.maxHealth}`;
        
        // Stamina
        const staminaPercent = (this.player.stamina / this.player.maxStamina) * 100;
        document.getElementById('stamina-bar').style.width = `${staminaPercent}%`;
        
        // Flashlight
        const flashlightPercent = (this.player.flashlightBattery / this.player.flashlightMax) * 100;
        document.getElementById('flashlight-bar').style.width = `${flashlightPercent}%`;
        document.getElementById('flashlight-text').textContent = `${Math.floor(flashlightPercent)}%`;
        
        // Chapter
        document.getElementById('chapter-text').textContent = `Capítulo ${this.currentChapter}`;
        
        // FPS (debug)
        // document.getElementById('fps-counter').textContent = `FPS: ${this.fps}`;
    }
    
    render() {
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED) {
            // Draw level
            this.currentLevel.draw(this.ctx, this.camera);
            
            // Draw player
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            this.player.draw(this.ctx);
            this.ctx.restore();
            
            // Draw entities
            this.currentLevel.drawEntities(this.ctx, this.camera, this.player);
            
            // Draw flashlight darkness effect
            this.player.drawFlashlightEffect(this.ctx, this.width, this.height);
            
            // Draw dialog overlay
            if (this.currentDialog) {
                this.drawDialog();
            }
            
            // Draw interaction prompt
            if (this.player.canInteract) {
                this.drawInteractionPrompt();
            }
        }
        
        // Draw FPS debug
        if (this.state === GAME_STATES.PLAYING) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, this.height - 10);
        }
    }
    
    drawDialog() {
        const padding = 20;
        const boxHeight = 80;
        const boxY = this.height - boxHeight - padding;
        
        // Dialog box background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(padding, boxY, this.width - padding * 2, boxHeight);
        
        // Border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(padding, boxY, this.width - padding * 2, boxHeight);
        
        // Speaker
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(this.currentDialog.speaker, padding * 2, boxY + 25);
        
        // Message
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(this.currentDialog.text, padding * 2, boxY + 50);
        
        // Continue prompt
        this.ctx.fillStyle = '#888';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('[E] Continuar', this.width - padding * 3, boxY + boxHeight - 15);
    }
    
    drawInteractionPrompt() {
        const screenX = this.player.x - this.camera.x;
        const screenY = this.player.y - this.camera.y - 30;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(screenX - 30, screenY - 15, 60, 30);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('[E]', screenX, screenY + 5);
        this.ctx.textAlign = 'left';
    }
    
    // Menu handlers
    handleStartGame() {
        this.startNewGame();
    }
    
    handleContinue() {
        // TODO: Load saved game from localStorage
        this.startNewGame();
    }
    
    handleSettings() {
        document.getElementById('settings-screen').classList.remove('hidden');
    }
    
    handleQuit() {
        this.showMenu();
    }
    
    handleRestart() {
        document.getElementById('game-over-screen').classList.add('hidden');
        this.startNewGame();
    }
    
    handleMainMenu() {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.add('hidden');
        this.showMenu();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('game-canvas');
    game.init();
    
    // Make game accessible globally for button handlers
    window.game = game;
});