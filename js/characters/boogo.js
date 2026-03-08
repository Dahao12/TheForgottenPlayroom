// Boogo - Chapter 1 Monster
// Teleports when not watched, freezes when observed
class Boogo extends Enemy {
    constructor(x, y) {
        super(x, y, CHARACTER_TYPES.BOOGO);
        
        this.emoji = '🧸';
        this.color = '#8B4513';
        
        this.speed = 1.5;
        this.chaseSpeed = 0; // Doesn't chase normally
        this.teleportCooldown = 5000; // 5 seconds
        this.teleportRange = { min: 100, max: 200 };
        this.lastTeleportTime = 0;
        
        this.isBeingWatched = false;
        this.teleportWarningTime = 0;
        
        this.maxHealth = 50;
        this.health = this.maxHealth;
        this.damage = 30;
    }
    
    update(deltaTime, player, tiles, tileSize, audio) {
        if (!this.isAlive) return;
        
        // Check if player is watching (looking at Boogo)
        this.isBeingWatched = this.isPlayerWatching(player);
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        if (this.isBeingWatched) {
            // Freeze when watched
            this.isChasing = false;
        } else {
            // Not watched - try to teleport near player
            const now = Date.now();
            if (now - this.lastTeleportTime > this.teleportCooldown) {
                this.teleportBehindPlayer(player, tiles, tileSize);
                this.lastTeleportTime = now;
                audio.play('boogo_whisper');
            }
        }
        
        // Try to attack if close enough
        if (distToPlayer <= this.attackRange) {
            this.tryAttack(player, audio);
        }
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 200) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    isPlayerWatching(player) {
        // Check if player's flashlight is pointing toward Boogo
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        const playerAngle = Math.atan2(player.direction.y, player.direction.x);
        
        let angleDiff = Math.abs(angleToPlayer - (playerAngle + Math.PI));
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        
        // Player is watching if angle is within 90 degrees and flashlight is on
        return angleDiff < toRadians(90) && player.flashlightOn;
    }
    
    teleportBehindPlayer(player, tiles, tileSize) {
        // Calculate position behind player
        const behindAngle = Math.atan2(player.direction.y, player.direction.x) + Math.PI;
        const distance = Math.randomRange(this.teleportRange.min, this.teleportRange.max);
        
        let newX = player.x + Math.cos(behindAngle) * distance;
        let newY = player.y + Math.sin(behindAngle) * distance;
        
        // Check if valid position
        const tileX = Math.floor(newX / tileSize);
        const tileY = Math.floor(newY / tileSize);
        
        if (tiles[tileY] && tiles[tileY][tileX] !== TILES.WALL) {
            this.x = newX;
            this.y = newY;
            this.direction = player.direction;
        }
    }
    
    playSound(audio) {
        audio.play('boogo_whisper');
    }
    
    onAttack(player, audio) {
        // Whisper when attacking
        audio.play('boogo_whisper');
    }
    
    drawSprite(ctx) {
        // Draw Boogo emoji
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, this.y + this.height / 2, 32);
        
        // Draw "watching" indicator
        if (this.isBeingWatched) {
            drawCircle(ctx, this.x + this.width / 2, this.y - 10, 5, '#00ff00', true);
        } else {
            drawCircle(ctx, this.x + this.width / 2, this.y - 10, 5, '#ff0000', true);
        }
    }
}