// Robot1028 - Chapter 2 Monster
// Treacherous robot that pretends to help then attacks
class Robot1028 extends Enemy {
    constructor(x, y) {
        super(x, y, CHARACTER_TYPES.ROBOT1028);
        
        this.emoji = '🤖';
        this.color = '#666666';
        
        this.speed = 1;
        this.chaseSpeed = 4;
        
        this.isHelping = false;
        this.hasBetrayed = false;
        this.betrayalChance = 0.7;
        this.rechargeTime = 10000;
        this.rechargeTimer = 0;
        this.isHostile = false;
        
        this.eyeColor = '#00ffff'; // Cyan = friendly, Red = hostile
        this.eyesGlowing = true;
        this.eyeBlinkTimer = 0;
        
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damage = 40;
        
        this.helpPhrases = [
            "¡Hola! Puedo ayudarte...",
            "¡Soy tu amigo!",
            "Déjame abrir esa puerta...",
            "Sígueme, conozco el camino..."
        ];
        this.hostilePhrases = [
            "¡ERROR! ¡ELIMINAR!",
            "¡objetivo detectado!",
            "¡INICIANDO PROTOCOLO DE ELIMINACIÓN!"
        ];
    }
    
    update(deltaTime, player, tiles, tileSize, audio) {
        if (!this.isAlive) return;
        
        this.rechargeTimer += deltaTime;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        if (this.isHelping && !this.isHostile) {
            // Act friendly
            this.moveTowardPlayer(deltaTime, player, tiles, tileSize);
            
            // Deciding to betray
            if (distToPlayer < 50 && !this.hasBetrayed && Math.random() < 0.01) {
                this.betray(audio);
            }
        } else if (this.isHostile) {
            // Chase and attack
            this.eyeColor = '#ff0000';
            
            if (this.canSeePlayer(player, tiles, tileSize)) {
                this.isChasing = true;
                this.chase(deltaTime, player.x, player.y, tiles, tileSize);
                
                if (distToPlayer <= this.attackRange) {
                    this.tryAttack(player, audio);
                }
            }
            
            // Calm down after recharge time
            if (this.rechargeTimer > this.rechargeTime) {
                this.isHostile = false;
                this.hasBetrayed = false;
                this.isHelping = true;
                this.eyeColor = '#00ffff';
                this.rechargeTimer = 0;
            }
        } else {
            // Default behavior
            if (distToPlayer < 100) {
                this.isHelping = true;
            }
        }
        
        // Eye blinking
        this.eyeBlinkTimer += deltaTime;
        if (this.eyeBlinkTimer > 3000) {
            this.eyesGlowing = !this.eyesGlowing;
            this.eyeBlinkTimer = 0;
        }
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 200) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    betray(audio) {
        this.hasBetrayed = true;
        this.isHelping = false;
        this.isHostile = true;
        this.eyeColor = '#ff0000';
        this.rechargeTimer = 0;
        audio.play('robot_beep');
    }
    
    moveTowardPlayer(deltaTime, player, tiles, tileSize) {
        const dir = normalize(player.x - this.x, player.y - this.y);
        
        const newX = this.x + dir.x * this.speed * 0.5;
        const newY = this.y + dir.y * this.speed * 0.5;
        
        if (!checkTileCollision(newX, this.y, this.width, this.height, tiles, tileSize)) {
            this.x = newX;
        }
        
        if (!checkTileCollision(this.x, newY, this.width, this.height, tiles, tileSize)) {
            this.y = newY;
        }
        
        this.direction = { x: dir.x, y: dir.y };
    }
    
    playSound(audio) {
        audio.play('robot_beep');
    }
    
    onAttack(player, audio) {
        audio.play('robot_beep');
    }
    
    drawSprite(ctx) {
        // Draw Robot emoji
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, this.y + this.height / 2, 32);
        
        // Draw eye color indicator
        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw state text
        if (this.isHelping && !this.isHostile) {
            drawText(ctx, '🤝', this.x + this.width / 2, this.y - 15, '#00ffff');
        } else if (this.isHostile) {
            drawText(ctx, '⚠️', this.x + this.width / 2, this.y - 15, '#ff0000');
        }
    }
}