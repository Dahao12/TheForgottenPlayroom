// Slimer - Chapter 2 Monster
// Slime that leaves slowing trail
class Slimer extends Enemy {
    constructor(x, y) {
        super(x, y, CHARACTER_TYPES.SLIMER);
        
        this.emoji = '🟢';
        this.color = '#00AA00';
        
        this.speed = 2;
        this.chaseSpeed = 3;
        
        this.trailInterval = 500; // ms
        this.lastTrailTime = 0;
        this.trailDuration = 5000; // 5 seconds
        
        this.slimeTrails = [];
        this.wobbleAmount = 0.2;
        this.wobbleSpeed = 2;
        this.wobbleOffset = 0;
        
        this.originalScale = { x: 32, y: 32 };
        
        this.maxHealth = 80;
        this.health = this.maxHealth;
        this.damage = 10;
    }
    
    update(deltaTime, player, tiles, tileSize, audio) {
        if (!this.isAlive) return;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        // Create slime trail
        const now = Date.now();
        if (now - this.lastTrailTime > this.trailInterval) {
            this.createTrail();
            this.lastTrailTime = now;
        }
        
        // Update trails
        this.slimeTrails = this.slimeTrails.filter(trail => 
            now - trail.timestamp < this.trailDuration
        );
        
        // Check if player is on trail
        for (const trail of this.slimeTrails) {
            if (distance(player.x, player.y, trail.x, trail.y) < 30) {
                // Slow player
                player.speed = GAME_CONFIG.PLAYER_SPEED * GAME_CONFIG.SLIMER_SLOW_AMOUNT;
                break;
            } else {
                player.speed = GAME_CONFIG.PLAYER_SPEED;
            }
        }
        
        // Chase behavior
        if (this.canSeePlayer(player, tiles, tileSize)) {
            this.isChasing = true;
            this.chase(deltaTime, player.x, player.y, tiles, tileSize);
            
            if (distToPlayer <= this.attackRange) {
                this.tryAttack(player, audio);
            }
        } else if (this.isChasing && this.lastKnownPlayerPos) {
            const distToLastKnown = distance(this.x, this.y, this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y);
            if (distToLastKnown < 10) {
                this.isChasing = false;
                this.lastKnownPlayerPos = null;
            } else {
                this.chase(deltaTime, this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y, tiles, tileSize);
            }
        }
        
        // Wobble animation
        this.wobbleOffset += deltaTime * 0.01 * this.wobbleSpeed;
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 200) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    createTrail() {
        this.slimeTrails.push({
            x: this.x,
            y: this.y,
            timestamp: Date.now()
        });
        
        // Limit trails
        if (this.slimeTrails.length > 20) {
            this.slimeTrails.shift();
        }
    }
    
    playSound(audio) {
        audio.play('slime_gurgle');
    }
    
    onAttack(player, audio) {
        audio.play('slime_gurgle');
    }
    
    drawSprite(ctx) {
        // Draw trails
        ctx.fillStyle = 'rgba(0, 170, 0, 0.3)';
        for (const trail of this.slimeTrails) {
            const age = (Date.now() - trail.timestamp) / this.trailDuration;
            ctx.globalAlpha = 1 - age;
            ctx.beginPath();
            ctx.arc(trail.x + 16, trail.y + 16, 20, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Draw Slimer emoji with wobble
        const wobbleX = Math.sin(this.wobbleOffset) * this.wobbleAmount * 5;
        const wobbleY = Math.cos(this.wobbleOffset * 1.5) * this.wobbleAmount * 5;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2 + wobbleX, this.y + this.height / 2 + wobbleY);
        
        // Draw hat :tophat:
        drawText(ctx, '🎩', 0, -20, '#000000');
        
        // Draw body
        drawEmoji(ctx, this.emoji, 0, 0, 36);
        
        ctx.restore();
    }
    
    drawTrails(ctx) {
        ctx.fillStyle = 'rgba(0, 170, 0, 0.2)';
        for (const trail of this.slimeTrails) {
            ctx.beginPath();
            ctx.arc(trail.x + 16, trail.y + 16, 25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}