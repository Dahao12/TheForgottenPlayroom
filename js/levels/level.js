// Base Level Class
class Level {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.tiles = [];
        this.width = 0;
        this.height = 0;
        
        this.playerSpawn = { x: 100, y: 100 };
        this.enemies = [];
        this.allies = [];
        this.items = [];
        this.doors = [];
        this.endZone = null;
        
        this.ambientSounds = [];
        this.background = '#0a0a0a';
        
        this.dialogQueue = [];
        this.cutscenes = [];
    }
    
    load(tileData) {
        this.tiles = tileData.tiles;
        this.width = tileData.tiles[0].length;
        this.height = tileData.tiles.length;
        
        // Find spawn points
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                const tile = this.tiles[y][x];
                
                if (tile === TILES.SPAWN) {
                    this.playerSpawn = { 
                        x: x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
                        y: y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2
                    };
                    this.tiles[y][x] = TILES.FLOOR;
                }
                
                if (tile === TILES.ENEMY_SPAWN) {
                    this.enemies.push({ x, y });
                    this.tiles[y][x] = TILES.FLOOR;
                }
                
                if (tile === TILES.ITEM) {
                    this.items.push({ 
                        x: x * GAME_CONFIG.TILE_SIZE,
                        y: y * GAME_CONFIG.TILE_SIZE 
                    });
                }
                
                if (tile === TILES.END_ZONE) {
                    this.endZone = {
                        x: x * GAME_CONFIG.TILE_SIZE,
                        y: y * GAME_CONFIG.TILE_SIZE,
                        width: GAME_CONFIG.TILE_SIZE,
                        height: GAME_CONFIG.TILE_SIZE
                    };
                    this.tiles[y][x] = TILES.FLOOR;
                }
            }
        }
    }
    
    createEnemies() {
        // Override in child classes
        return [];
    }
    
    createAllies() {
        // Override in child classes
        return [];
    }
    
    update(deltaTime, player, audio) {
        // Update enemies
        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                enemy.update(deltaTime, player, this.tiles, GAME_CONFIG.TILE_SIZE, audio);
            }
        }
        
        // Update allies
        for (const ally of this.allies) {
            if (ally.isAlive) {
                ally.update(deltaTime, player, this.tiles, GAME_CONFIG.TILE_SIZE, this.enemies, audio);
            }
        }
    }
    
    checkCollisions(player, audio) {
        // Check enemy collisions
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            
            const dist = distance(player.x, player.y, enemy.x, enemy.y);
            if (dist < player.width / 2 + enemy.width / 2) {
                // Collision with enemy
                return enemy;
            }
        }
        
        // Check end zone
        if (this.endZone) {
            if (player.x > this.endZone.x && 
                player.x < this.endZone.x + this.endZone.width &&
                player.y > this.endZone.y && 
                player.y < this.endZone.y + this.endZone.height) {
                return 'end';
            }
        }
        
        return null;
    }
    
    draw(ctx, camera) {
        // Draw background
        ctx.fillStyle = this.background;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw tiles
        for (let y = 0; y < this.tiles.length; y++) {
            for (let x = 0; x < this.tiles[y].length; x++) {
                const tile = this.tiles[y][x];
                const drawX = x * GAME_CONFIG.TILE_SIZE - camera.x;
                const drawY = y * GAME_CONFIG.TILE_SIZE - camera.y;
                
                // Only draw visible tiles
                if (drawX < -GAME_CONFIG.TILE_SIZE || drawX > ctx.canvas.width) continue;
                if (drawY < -GAME_CONFIG.TILE_SIZE || drawY > ctx.canvas.height) continue;
                
                switch (tile) {
                    case TILES.FLOOR:
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        // Floor pattern
                        ctx.strokeStyle = '#222';
                        ctx.strokeRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        break;
                        
                    case TILES.WALL:
                        ctx.fillStyle = '#333';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        // Wall pattern
                        ctx.fillStyle = '#2a2a2a';
                        ctx.fillRect(drawX + 2, drawY + 2, GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
                        break;
                        
                    case TILES.DOOR:
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(drawX + 4, drawY + 2, GAME_CONFIG.TILE_SIZE - 8, GAME_CONFIG.TILE_SIZE - 4);
                        // Door handle
                        ctx.fillStyle = '#FFD700';
                        ctx.beginPath();
                        ctx.arc(drawX + GAME_CONFIG.TILE_SIZE - 10, drawY + GAME_CONFIG.TILE_SIZE / 2, 3, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case TILES.ITEM:
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        ctx.fillStyle = '#FFD700';
                        ctx.beginPath();
                        ctx.arc(drawX + GAME_CONFIG.TILE_SIZE / 2, drawY + GAME_CONFIG.TILE_SIZE / 2, 8, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case TILES.HIDDEN_ZONE:
                        ctx.fillStyle = '#111';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        break;
                        
                    case TILES.END_ZONE:
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        // End zone indicator
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                        ctx.fillRect(drawX, drawY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                        break;
                }
            }
        }
        
        // Draw end zone
        if (this.endZone) {
            const drawX = this.endZone.x - camera.x;
            const drawY = this.endZone.y - camera.y;
            
            ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.fillRect(drawX, drawY, this.endZone.width, this.endZone.height);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(drawX, drawY, this.endZone.width, this.endZone.height);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, this.endZone.width, this.endZone.height);
        }
    }
    
    drawEntities(ctx, camera, player) {
        // Draw enemies
        for (const enemy of this.enemies) {
            if (enemy.isAlive) {
                enemy.x -= camera.x;
                enemy.y -= camera.y;
                enemy.draw(ctx, player.x - camera.x, player.y - camera.y, player.flashlightRadius);
                enemy.x += camera.x;
                enemy.y += camera.y;
            }
        }
        
        // Draw allies
        for (const ally of this.allies) {
            if (ally.isAlive) {
                const allyX = ally.x - camera.x;
                const allyY = ally.y - camera.y;
                ally.draw(ctx, player.x - camera.x, player.y - camera.y, player.flashlightRadius, allyX, allyY);
            }
        }
    }
    
    getDeathMessage(enemyType) {
        return DEATH_MESSAGES[enemyType] || {
            message: "Has sido atrapado...",
            monster: "Algo te encontró en la oscuridad"
        };
    }
}