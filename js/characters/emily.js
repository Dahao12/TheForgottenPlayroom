// Emily - Chapter 4 Boss
// The true villain who controls all monsters
class Emily {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.type = CHARACTER_TYPES.EMILY;
        
        this.emoji = '👧';
        this.color = '#FF00FF';
        
        this.health = 500;
        this.maxHealth = 500;
        this.isAlive = true;
        
        this.phase = 1; // 1, 2, 3
        this.attackCooldown = 3000;
        this.lastAttackTime = 0;
        
        this.summonedMonsters = [];
        this.maxMonsters = 3;
        
        this.floats = false;
        this.floatOffset = 0;
        this.floatSpeed = 2;
        
        this.dialog = [
            "¿También quieres jugar conmigo?",
            "Todos mis juguetes son míos... ¡para siempre!",
            "¡Nunca saldrás de aquí!",
            "¡Mis amigos vendrán a buscarte!",
            "¿Por qué no te quedas... para siempre?"
        ];
        this.currentDialog = 0;
        
        this.teleportCooldown = 5000;
        this.lastTeleportTime = 0;
        
        // Attack patterns
        this.attackPattern = 0;
        this.attackPatterns = [
            'summon',
            'teleport',
            'laugh',
            'chase'
        ];
    }
    
    update(deltaTime, player, tiles, tileSize, audio, monsters) {
        if (!this.isAlive) return;
        
        // Phase transitions
        this.updatePhase();
        
        // Float animation
        this.floatOffset = Math.sin(Date.now() * 0.002) * 10;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        // Behavior based on phase
        switch (this.phase) {
            case 1:
                this.phaseOneBehavior(deltaTime, player, tiles, tileSize, audio, monsters);
                break;
            case 2:
                this.phaseTwoBehavior(deltaTime, player, tiles, tileSize, audio, monsters);
                break;
            case 3:
                this.phaseThreeBehavior(deltaTime, player, tiles, tileSize, audio, monsters);
                break;
        }
        
        // Try attack if close
        if (distToPlayer <= 50) {
            this.tryAttack(player, audio);
        }
    }
    
    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent <= 0.33) {
            this.phase = 3;
        } else if (healthPercent <= 0.66) {
            this.phase = 2;
        } else {
            this.phase = 1;
        }
    }
    
    phaseOneBehavior(deltaTime, player, tiles, tileSize, audio, monsters) {
        // Summon monsters periodically
        const now = Date.now();
        if (now - this.lastAttackTime > this.attackCooldown) {
            this.summon(monsters);
            this.lastAttackTime = now;
        }
    }
    
    phaseTwoBehavior(deltaTime, player, tiles, tileSize, audio, monsters) {
        const now = Date.now();
        
        // More aggressive - teleport and chase
        if (now - this.lastTeleportTime > this.teleportCooldown) {
            this.teleportNearPlayer(player, tiles, tileSize);
            this.lastTeleportTime = now;
        }
        
        // Also summon
        if (now - this.lastAttackTime > this.attackCooldown) {
            this.summon(monsters);
            this.lastAttackTime = now;
        }
    }
    
    phaseThreeBehavior(deltaTime, player, tiles, tileSize, audio, monsters) {
        const now = Date.now();
        
        // Final phase - all attacks
        if (now - this.lastTeleportTime > this.teleportCooldown / 2) {
            this.teleportNearPlayer(player, tiles, tileSize);
            this.lastTeleportTime = now;
        }
        
        if (now - this.lastAttackTime > this.attackCooldown / 2) {
            this.summon(monsters);
            this.lastAttackTime = now;
        }
        
        // Direct chase
        const dir = normalize(player.x - this.x, player.y - this.y);
        this.x += dir.x * 2;
        this.y += dir.y * 2;
    }
    
    summon(monsters) {
        // This would summon monsters - handled by game class
        console.log('Emily summons monsters!');
    }
    
    teleportNearPlayer(player, tiles, tileSize) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 100;
        
        this.x = player.x + Math.cos(angle) * dist;
        this.y = player.y + Math.sin(angle) * dist;
    }
    
    tryAttack(player, audio) {
        const now = Date.now();
        if (now - this.lastAttackTime < 1000) return;
        
        this.lastAttackTime = now;
        player.takeDamage(30);
        audio.play('emily_laugh');
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
        
        // Draw Emily emoji with offset
        const drawY = this.y + this.floatOffset;
        
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, drawY + this.height / 2, 40);
        
        // Draw health bar
        const barWidth = 50;
        const barHeight = 6;
        const barX = this.x - barWidth / 2 + this.width / 2;
        const barY = this.y - 25;
        
        drawRect(ctx, barX, barY, barWidth, barHeight, '#333333');
        
        const healthPercent = this.health / this.maxHealth;
        let healthColor = '#ff0000';
        if (healthPercent > 0.66) healthColor = '#00ff00';
        else if (healthPercent > 0.33) healthColor = '#ffff00';
        
        drawRect(ctx, barX, barY, barWidth * healthPercent, barHeight, healthColor);
        
        // Draw phase indicator
        const phaseEmoji = ['💀', '💀💀', '💀💀💀'][this.phase - 1];
        drawText(ctx, phaseEmoji, this.x + this.width / 2, this.y - 35, '#ff00ff');
    }
}