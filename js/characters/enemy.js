// Base Enemy Class
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = type;
        
        this.speed = 2;
        this.chaseSpeed = 4;
        this.attackRange = 30;
        this.sightRange = 200;
        this.sightAngle = 90; // degrees
        
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 25;
        this.attackCooldown = 2000; // ms
        
        this.isAlive = true;
        this.isChasing = false;
        this.isAttacking = false;
        this.lastAttackTime = 0;
        
        this.direction = DIRECTIONS.DOWN;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        this.lastKnownPlayerPos = null;
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.waitTimer = 0;
        
        // Sound
        this.lastSoundTime = 0;
        this.soundCooldown = 3000;
    }
    
    update(deltaTime, player, tiles, tileSize, audio) {
        if (!this.isAlive) return;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        // Check if can see player
        if (this.canSeePlayer(player, tiles, tileSize)) {
            this.isChasing = true;
            this.lastKnownPlayerPos = { x: player.x, y: player.y };
            
            // Chase player
            this.chase(deltaTime, player.x, player.y, tiles, tileSize);
            
            // Play detection sound
            if (Date.now() - this.lastSoundTime > this.soundCooldown) {
                this.playSound(audio);
                this.lastSoundTime = Date.now();
            }
            
            // Attack if close enough
            if (distToPlayer <= this.attackRange) {
                this.tryAttack(player, audio);
            }
        } else if (this.isChasing && this.lastKnownPlayerPos) {
            // Go to last known player position
            const distToLastKnown = distance(this.x, this.y, this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y);
            
            if (distToLastKnown < 10) {
                // Lost the player
                this.isChasing = false;
                this.lastKnownPlayerPos = null;
            } else {
                this.chase(deltaTime, this.lastKnownPlayerPos.x, this.lastKnownPlayerPos.y, tiles, tileSize);
            }
        } else {
            // Patrol
            this.patrol(deltaTime, tiles, tileSize);
        }
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 200) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    canSeePlayer(player, tiles, tileSize) {
        const dist = distance(this.x, this.y, player.x, player.y);
        
        if (dist > this.sightRange) return false;
        
        // Check if player is in view cone
        const angleToPlayer = angleBetween(this.x, this.y, player.x, player.y);
        const facingAngle = Math.atan2(this.direction.y, this.direction.x);
        let angleDiff = Math.abs(angleToPlayer - facingAngle);
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        
        if (angleDiff > toRadians(this.sightAngle / 2)) return false;
        
        // Check line of sight
        return hasLineOfSight(this.x, this.y, player.x, player.y, tiles, tileSize);
    }
    
    chase(deltaTime, targetX, targetY, tiles, tileSize) {
        const dir = normalize(targetX - this.x, targetY - this.y);
        
        const newX = this.x + dir.x * this.chaseSpeed;
        const newY = this.y + dir.y * this.chaseSpeed;
        
        if (!checkTileCollision(newX, this.y, this.width, this.height, tiles, tileSize)) {
            this.x = newX;
        }
        
        if (!checkTileCollision(this.x, newY, this.width, this.height, tiles, tileSize)) {
            this.y = newY;
        }
        
        // Update direction
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
            this.direction = dir.x > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else {
            this.direction = dir.y > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }
    }
    
    patrol(deltaTime, tiles, tileSize) {
        if (this.patrolPoints.length === 0) return;
        
        if (this.waitTimer > 0) {
            this.waitTimer -= deltaTime;
            return;
        }
        
        const target = this.patrolPoints[this.currentPatrolIndex];
        const dist = distance(this.x, this.y, target.x, target.y);
        
        if (dist < 5) {
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            this.waitTimer = 2000;
            return;
        }
        
        const dir = normalize(target.x - this.x, target.y - this.y);
        
        const newX = this.x + dir.x * this.speed;
        const newY = this.y + dir.y * this.speed;
        
        if (!checkTileCollision(newX, this.y, this.width, this.height, tiles, tileSize)) {
            this.x = newX;
        }
        
        if (!checkTileCollision(this.x, newY, this.width, this.height, tiles, tileSize)) {
            this.y = newY;
        }
        
        // Update direction
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
            this.direction = dir.x > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        } else {
            this.direction = dir.y > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
        }
    }
    
    tryAttack(player, audio) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldown) return;
        
        this.lastAttackTime = now;
        this.isAttacking = true;
        
        // Deal damage to player
        if (player.takeDamage(this.damage)) {
            // Player is still alive
            audio.play('damage');
        } else {
            // Player died
            audio.play('death');
        }
        
        this.onAttack(player, audio);
    }
    
    onAttack(player, audio) {
        // Override in child classes
    }
    
    playSound(audio) {
        // Override in child classes
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isAlive = false;
            return false;
        }
        return true;
    }
    
    draw(ctx, playerX, playerY, flashlightRadius) {
        if (!this.isAlive) return;
        
        // Only draw if within flashlight range or close to player
        const dist = distance(this.x, this.y, playerX, playerY);
        if (dist > flashlightRadius * 1.5) return;
        
        // Draw enemy
        this.drawSprite(ctx);
    }
    
    drawSprite(ctx) {
        // Override in child classes
        drawCircle(ctx, this.x + this.width / 2, this.y + this.height / 2, this.width / 2, '#ff0000');
    }
}