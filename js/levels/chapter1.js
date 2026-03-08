// Chapter 1 Level - The Entrance
class Chapter1 extends Level {
    constructor() {
        super(1, 'Capítulo 1: La Entrada');
    }
    
    // Generate level map
    generate() {
        // 40x30 tile map
        const map = [];
        
        for (let y = 0; y < 30; y++) {
            const row = [];
            for (let x = 0; x < 40; x++) {
                // Border walls
                if (x === 0 || x === 39 || y === 0 || y === 29) {
                    row.push(TILES.WALL);
                }
                // Rooms
                else if (this.generateRoom(x, y)) {
                    row.push(TILES.WALL);
                }
                else {
                    row.push(TILES.FLOOR);
                }
            }
            map.push(row);
        }
        
        // Player spawn (entrance)
        map[2][2] = TILES.SPAWN;
        
        // End zone (exit to chapter 2)
        map[27][37] = TILES.END_ZONE;
        
        // Doors
        map[10][10] = TILES.DOOR;
        map[10][20] = TILES.DOOR;
        map[20][15] = TILES.DOOR;
        map[25][30] = TILES.DOOR;
        
        // Items (batteries, keys)
        map[5][15] = TILES.ITEM;
        map[15][25] = TILES.ITEM;
        map[22][10] = TILES.ITEM;
        
        // Enemy spawns
        map[8][12] = TILES.ENEMY_SPAWN; // Boogo
        map[18][30] = TILES.ENEMY_SPAWN; // Catstar
        map[25][20] = TILES.ENEMY_SPAWN; // Boogo
        
        return map;
    }
    
    generateRoom(x, y) {
        // Reception room (top left)
        if (y >= 2 && y <= 8 && x >= 5 && x <= 15) {
            if (x === 5 || x === 15) return true;
            if (y === 2 || y === 8) return true;
        }
        
        // Office area (middle)
        if (y >= 10 && y <= 18 && x >= 5 && x <= 25) {
            if (x === 5 || x === 25) return true;
            if (y === 10 || y === 18) return true;
            // Cubicle walls
            if (x === 10 || x === 15 || x === 20) {
                if (y >= 12 && y <= 16) return true;
            }
        }
        
        // Corridor (vertical)
        if (x >= 28 && x <= 32 && y >= 5 && y <= 25) {
            if (x === 28 || x === 32) return true;
            if (y === 5 || y === 25) return true;
        }
        
        // Storage (bottom right)
        if (y >= 20 && y <= 28 && x >= 18 && x <= 38) {
            if (x === 18 || x === 38) return true;
            if (y === 20 || y === 28) return true;
        }
        
        return false;
    }
    
    createEnemies() {
        const enemies = [
            new Boogo(this.enemies[0].x * GAME_CONFIG.TILE_SIZE, this.enemies[0].y * GAME_CONFIG.TILE_SIZE),
            new Catstar(this.enemies[1].x * GAME_CONFIG.TILE_SIZE, this.enemies[1].y * GAME_CONFIG.TILE_SIZE),
            new Boogo(this.enemies[2].x * GAME_CONFIG.TILE_SIZE, this.enemies[2].y * GAME_CONFIG.TILE_SIZE)
        ];
        
        return enemies;
    }
    
    getDialogs() {
        return [
            { speaker: 'Sistema', text: 'Capítulo 1: La Entrada' },
            { speaker: 'Sistema', text: 'Encuentra la salida del edificio abandonado...' },
            { speaker: 'Sistema', text: 'ADVERTENCIA: Se han detectado entidades hostiles' }
        ];
    }
}