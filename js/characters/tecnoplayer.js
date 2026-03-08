// TecnoPlayer - Chapter 2 Ally
// Helper robot with TV head that guides player
class TecnPlayer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = CHARACTER_TYPES.TECNO;
        
        this.emoji = '📺';
        this.speed = 2;
        this.followDistance = 50;
        
        this.health = 100;
        this.maxHealth = 100;
        this.isAlive = true;
        
        this.currentFace = 'happy'; // happy, worried, thinking, alert, success, hacking
        this.faceEmojis = {
            happy: '😊',
            worried: '😟',
            thinking: '🤔',
            alert: '⚠️',
            success: '✅',
            hacking: '💻'
        };
        
        this.isGuiding = false;
        this.currentGuidePoint = 0;
        this.guidePoints = [];
        
        this.detectRange = 150;
        this.detectedEnemy = null;
        
        this.hackingDoor = false;
        this.hackProgress = 0;
        this.hackTarget = null;
        
        this.lastSoundTime = 0;
        this.soundCooldown = 2000;
    }
    
    update(deltaTime, player, tiles, tileSize, enemies, audio) {
        if (!this.isAlive) return;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        // Detect nearby enemies
        this.detectEnemies(enemies);
        
        if (this.detectedEnemy) {
            this.currentFace = 'alert';
            this.alertPlayer(player, audio);
        } else if (this.hackingDoor) {
            this.currentFace = 'hacking';
            this.hackDoor(deltaTime, player, audio);
        } else if (distToPlayer > this.followDistance && !this.isGuiding) {
            // Follow player
            this.currentFace = 'thinking';
            this.followPlayer(player, tiles, tileSize);
        } else {
            this.currentFace = 'happy';
        }
        
        // Check for locked doors to hack
        this.checkForDoors(tiles, tileSize, player);
    }
    
    detectEnemies(enemies) {
        this.detectedEnemy = null;
        
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;
            
            const dist = distance(this.x, this.y, enemy.x, enemy.y);
            if (dist < this.detectRange) {
                this.detectedEnemy = enemy;
                return;
            }
        }
    }
    
    alertPlayer(player, audio) {
        // Play alert sound
        const now = Date.now();
        if (now - this.lastSoundTime > this.soundCooldown) {
            audio.play('tecnoplayer_beep');
            this.lastSoundTime = now;
        }
    }
    
    followPlayer(player, tiles, tileSize) {
        const dir = normalize(player.x - this.x, player.y - this.y);
        const stopDist = this.followDistance * 0.8;
        
        const newX = this.x + dir.x * this.speed;
        const newY = this.y + dir.y * this.speed;
        
        if (!checkTileCollision(newX, this.y, this.width, this.height, tiles, tileSize)) {
            this.x = newX;
        }
        if (!checkTileCollision(this.x, newY, this.width, this.height, tiles, tileSize)) {
            this.y = newY;
        }
    }
    
    checkForDoors(tiles, tileSize, player) {
        if (this.hackingDoor) return;
        
        const checkX = Math.floor(this.x / tileSize);
        const checkY = Math.floor(this.y / tileSize);
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const tx = checkX + dx;
                const ty = checkY + dy;
                
                if (tiles[ty] && tiles[ty][tx] === TILES.DOOR) {
                    this.hackingDoor = true;
                    this.hackTarget = { x: tx, y: ty };
                    this.hackProgress = 0;
                    return;
                }
            }
        }
    }
    
    hackDoor(deltaTime, player, audio) {
        this.hackProgress += deltaTime;
        
        if (this.hackProgress >= 3000) {
            // Hack complete - open door
            // This would be handled by the game class
            this.hackingDoor = false;
            this.hackProgress = 0;
            this.hackTarget = null;
            this.currentFace = 'success';
            audio.play('tecnoplayer_beep');
        }
    }
    
    getHackProgress() {
        return this.hackProgress / 3000; // 0 to 1
    }
    
    draw(ctx, playerX, playerY, flashlightRadius) {
        if (!this.isAlive) return;
        
        const dist = distance(this.x, this.y, playerX, playerY);
        if (dist > flashlightRadius * 1.5) return;
        
        // Draw TecnoPlayer emoji
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, this.y + this.height / 2, 28);
        
        // Draw face
        const faceEmoji = this.faceEmojis[this.currentFace] || this.faceEmojis.happy;
        drawText(ctx, faceEmoji, this.x + this.width / 2, this.y - 5, '#ffffff');
        
        // Draw hack progress bar if hacking
        if (this.hackingDoor) {
            const barWidth = 40;
            const barHeight = 6;
            const barX = this.x - barWidth / 2 + this.width / 2;
            const barY = this.y - 20;
            
            // Background
            drawRect(ctx, barX, barY, barWidth, barHeight, '#333333');
            // Progress
            drawRect(ctx, barX, barY, barWidth * this.getHackProgress(), barHeight, '#00ff00');
        }
        
        // Draw detection range if enemy nearby
        if (this.detectedEnemy) {
            drawCircle(ctx, this.x + this.width / 2, this.y + this.height / 2, this.detectRange, '#ff0000', true, 2);
            drawText(ctx, '⚠️', this.x + this.width / 2, this.y + this.height / 2 - 30, '#ff0000');
        }
    }
}