// Catstar - Chapter 1 Monster
// Animatronic cat that ambushes from high places
class Catstar extends Enemy {
    constructor(x, y) {
        super(x, y, CHARACTER_TYPES.CATSTAR);
        
        this.emoji = '🦁';
        this.color = '#FFD700';
        
        this.speed = 2;
        this.chaseSpeed = 5;
        this.leapRange = 150;
        this.leapForce = 10;
        
        this.isHiding = true;
        this.hideTimer = 0;
        this.hideDuration = 3000;
        this.isLeaping = false;
        this.leapTarget = null;
        
        this.maxHealth = 75;
        this.health = this.maxHealth;
        this.damage = 35;
        
        this.hidingSpots = [];
    }
    
    update(deltaTime, player, tiles, tileSize, audio) {
        if (!this.isAlive) return;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        if (this.isHiding) {
            this.hideTimer += deltaTime;
            
            // Reveal if player is close or after timer
            if (distToPlayer < this.leapRange || this.hideTimer > this.hideDuration) {
                this.hideTimer = 0;
                
                // Check if can leap
                if (distToPlayer < this.leapRange) {
                    this.isLeaping = true;
                    this.leapTarget = { x: player.x, y: player.y };
                    audio.play('catstar_hiss');
                }
                
                this.isHiding = false;
            }
        } else if (this.isLeaping) {
            // Leap toward player
            const dir = normalize(this.leapTarget.x - this.x, this.leapTarget.y - this.y);
            
            this.x += dir.x * this.chaseSpeed * 2;
            this.y += dir.y * this.chaseSpeed * 2;
            
            const distToTarget = distance(this.x, this.y, this.leapTarget.x, this.leapTarget.y);
            
            if (distToTarget < 10) {
                this.isLeaping = false;
                this.isChasing = true;
                
                // Try to attack if landed on player
                if (distToPlayer <= this.attackRange) {
                    this.tryAttack(player, audio);
                }
            }
        } else {
            // Normal chase behavior
            if (this.canSeePlayer(player, tiles, tileSize)) {
                this.isChasing = true;
                this.lastKnownPlayerPos = { x: player.x, y: player.y };
                this.chase(deltaTime, player.x, player.y, tiles, tileSize);
                
                if (distToPlayer <= this.attackRange) {
                    this.tryAttack(player, audio);
                }
            } else {
                this.isChasing = false;
                this.isHiding = true;
                this.hideTimer = 0;
            }
        }
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 100) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    playSound(audio) {
        audio.play('catstar_hiss');
    }
    
    onAttack(player, audio) {
        audio.play('catstar_hiss');
    }
    
    drawSprite(ctx) {
        // Draw Catstar emoji
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, this.y + this.height / 2, 32);
        
        // Draw state indicator
        if (this.isHiding) {
            // Hidden - draw eyes only
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(this.x + 5, this.y + 5, 6, 6);
            ctx.fillRect(this.x + this.width - 11, this.y + 5, 6, 6);
        } else if (this.isLeaping) {
            // Leaping - draw faster
            drawText(ctx, '💨', this.x + this.width / 2, this.y - 10, '#ffff00');
        }
        
        // Draw sight range when chasing
        if (this.isChasing && !this.isHiding) {
            drawCircle(ctx, this.x + this.width / 2, this.y + this.height / 2, this.sightRange, '#ffff00', true);
        }
    }
}