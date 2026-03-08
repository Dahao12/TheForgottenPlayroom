// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.speed = GAME_CONFIG.PLAYER_SPEED;
        this.runSpeed = GAME_CONFIG.PLAYER_RUN_SPEED;
        
        this.health = GAME_CONFIG.PLAYER_MAX_HEALTH;
        this.maxHealth = GAME_CONFIG.PLAYER_MAX_HEALTH;
        this.stamina = GAME_CONFIG.PLAYER_MAX_STAMINA;
        this.maxStamina = GAME_CONFIG.PLAYER_MAX_STAMINA;
        
        this.flashlightOn = true;
        this.flashlightBattery = GAME_CONFIG.FLASHLIGHT_BATTERY_MAX;
        this.flashlightMax = GAME_CONFIG.FLASHLIGHT_BATTERY_MAX;
        this.flashlightRadius = GAME_CONFIG.FLASHLIGHT_RADIUS;
        
        this.isRunning = false;
        this.direction = DIRECTIONS.DOWN;
        this.isAlive = true;
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
        
        this.inventory = [];
        this.currentItem = null;
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.emoji = '👤';
        
        // Interaction
        this.interactionRange = 50;
        this.canInteract = false;
        this.interactionTarget = null;
    }
    
    update(deltaTime, input, tiles, tileSize) {
        if (!this.isAlive) return;
        
        // Handle invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.isInvulnerable = false;
            }
        }
        
        // Movement
        const movement = input.getMovementDirection();
        let currentSpeed = this.speed;
        
        // Running (uses stamina)
        if (input.isKeyPressed(KEYS.SPACE) && this.stamina > 0 && (movement.x !== 0 || movement.y !== 0)) {
            currentSpeed = this.runSpeed;
            this.isRunning = true;
            this.stamina -= GAME_CONFIG.STAMINA_DRAIN;
            this.stamina = Math.max(0, this.stamina);
        } else {
            this.isRunning = false;
            // Regenerate stamina when not running
            if (this.stamina < this.maxStamina) {
                this.stamina += GAME_CONFIG.STAMINA_REGEN;
                this.stamina = Math.min(this.maxStamina, this.stamina);
            }
        }
        
        // Apply movement with collision
        const newX = this.x + movement.x * currentSpeed;
        const newY = this.y + movement.y * currentSpeed;
        
        // Check collision for X movement
        if (!checkTileCollision(newX, this.y, this.width, this.height, tiles, tileSize)) {
            this.x = newX;
        }
        
        // Check collision for Y movement
        if (!checkTileCollision(this.x, newY, this.width, this.height, tiles, tileSize)) {
            this.y = newY;
        }
        
        // Update direction
        if (movement.x !== 0 || movement.y !== 0) {
            if (Math.abs(movement.x) > Math.abs(movement.y)) {
                this.direction = movement.x > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            } else {
                this.direction = movement.y > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            }
        }
        
        // Flashlight toggle
        if (input.wasKeyJustPress(KEYS.F)) {
            this.flashlightOn = !this.flashlightOn;
        }
        
        // Flashlight battery drain
        if (this.flashlightOn) {
            this.flashlightBattery -= GAME_CONFIG.FLASHLIGHT_BATTERY_DRAIN;
            this.flashlightBattery = Math.max(0, this.flashlightBattery);
            
            // Auto turn off when battery empty
            if (this.flashlightBattery <= 0) {
                this.flashlightOn = false;
            }
        } else {
            // Recharge when off
            this.flashlightBattery += GAME_CONFIG.FLASHLIGHT_RECHARGE * 2;
            this.flashlightBattery = Math.min(this.flashlightMax, this.flashlightBattery);
        }
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 100) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
        
        // Update interaction range
        this.checkInteractables(tiles, tileSize);
    }
    
    checkInteractables(tiles, tileSize) {
        this.canInteract = false;
        this.interactionTarget = null;
        
        // Check for doors, items, etc. nearby
        const checkX = Math.floor(this.x / tileSize);
        const checkY = Math.floor(this.y / tileSize);
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const tx = checkX + dx;
                const ty = checkY + dy;
                
                if (tiles[ty] && tiles[ty][tx] === TILES.DOOR) {
                    this.canInteract = true;
                    this.interactionTarget = { type: 'door', x: tx, y: ty };
                    return;
                }
                
                if (tiles[ty] && tiles[ty][tx] === TILES.ITEM) {
                    this.canInteract = true;
                    this.interactionTarget = { type: 'item', x: tx, y: ty };
                    return;
                }
            }
        }
    }
    
    interact(tiles, tileSize) {
        if (!this.canInteract || !this.interactionTarget) return false;
        
        const { type, x, y } = this.interactionTarget;
        
        if (type === 'door') {
            // Open door
            tiles[y][x] = TILES.FLOOR;
            return true;
        }
        
        if (type === 'item') {
            // Collect item
            tiles[y][x] = TILES.FLOOR;
            return true;
        }
        
        return false;
    }
    
    takeDamage(amount) {
        if (this.isInvulnerable || !this.isAlive) return;
        
        this.health -= amount;
        this.isInvulnerable = true;
        this.invulnerabilityTime = 1000; // 1 second
        
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
        
        return this.isAlive;
    }
    
    heal(amount) {
        if (!this.isAlive) return;
        this.health = Math.min(this.maxHealth, this.health + amount);
    }
    
    draw(ctx) {
        if (!this.isAlive) return;
        
        // Flicker when invulnerable
        if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }
        
        // Draw player emoji
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, this.y + this.height / 2, 28);
        
        // Draw flashlight effect when on
        if (this.flashlightOn && this.flashlightBattery > 0) {
            const gradient = ctx.createRadialGradient(
                this.x + this.width / 2, this.y + this.height / 2, 0,
                this.x + this.width / 2, this.y + this.height / 2, this.flashlightRadius * (this.flashlightBattery / this.flashlightMax)
            );
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2, 
                this.y + this.height / 2, 
                this.flashlightRadius * (this.flashlightBattery / this.flashlightMax), 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw flashlight direction indicator
        if (this.flashlightOn) {
            ctx.strokeStyle = 'rgba(255, 255, 200, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
            
            let endX = this.x + this.width / 2;
            let endY = this.y + this.height / 2;
            
            if (this.direction === DIRECTIONS.UP) endY -= 30;
            else if (this.direction === DIRECTIONS.DOWN) endY += 30;
            else if (this.direction === DIRECTIONS.LEFT) endX -= 30;
            else if (this.direction === DIRECTIONS.RIGHT) endX += 30;
            
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    
    drawFlashlightEffect(ctx, canvasWidth, canvasHeight) {
        if (!this.flashlightOn || this.flashlightBattery <= 0) {
            // Complete darkness
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            return;
        }
        
        // Create darkness with flashlight hole
        const radius = this.flashlightRadius * (this.flashlightBattery / this.flashlightMax);
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, radius * 0.5,
            this.x + this.width / 2, this.y + this.height / 2, radius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Cut out flashlight area
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}