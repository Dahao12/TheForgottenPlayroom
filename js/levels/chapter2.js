// Chapter 2 Level - The Warehouse
class Chapter2 extends Level {
    constructor() {
        super(2, 'Capítulo 2: El Almacén');
    }
    
    generate() {
        const map = [];
        
        for (let y = 0; y < 35; y++) {
            const row = [];
            for (let x = 0; x < 50; x++) {
                if (x === 0 || x === 49 || y === 0 || y === 34) {
                    row.push(TILES.WALL);
                }
                else if (this.generateRoom(x, y)) {
                    row.push(TILES.WALL);
                }
                else {
                    row.push(TILES.FLOOR);
                }
            }
            map.push(row);
        }
        
        // Player spawn
        map[2][2] = TILES.SPAWN;
        
        // End zone
        map[32][47] = TILES.END_ZONE;
        
        // Doors
        map[8][15] = TILES.DOOR;
        map[15][25] = TILES.DOOR;
        map[22][35] = TILES.DOOR;
        map[28][20] = TILES.DOOR;
        
        // Items
        map[10][20] = TILES.ITEM;
        map[20][40] = TILES.ITEM;
        map[30][15] = TILES.ITEM;
        map[15][35] = TILES.ITEM;
        
        // Enemy spawns - more monsters in chapter 2
        map[6][10] = TILES.ENEMY_SPAWN; // 1028
        map[12][30] = TILES.ENEMY_SPAWN; // Ratuile
        map[8][40] = TILES.ENEMY_SPAWN; // Slimer
        map[20][15] = TILES.ENEMY_SPAWN; // 1028
        map[25][40] = TILES.ENEMY_SPAWN; // Ratuile
        map[30][25] = TILES.ENEMY_SPAWN; // Slimer
        
        // Ally spawn - Tecno Player
        map[5][5] = TILES.ENEMY_SPAWN; // Will be converted to ally
        
        return map;
    }
    
    generateRoom(x, y) {
        // Warehouse sections
        if (y >= 3 && y <= 10 && x >= 5 && x <= 20) {
            if (x === 5 || x === 20) return true;
            if (y === 3 || y === 10) return true;
        }
        
        if (y >= 3 && y <= 10 && x >= 25 && x <= 45) {
            if (x === 25 || x === 45) return true;
            if (y === 3 || y === 10) return true;
        }
        
        if (y >= 15 && y <= 25 && x >= 5 && x <= 30) {
            if (x === 5 || x === 30) return true;
            if (y === 15 || y === 25) return true;
            if (x === 12 || x === 20) return true;
        }
        
        if (y >= 28 && y <= 34 && x >= 10 && x <= 48) {
            if (x === 10 || x === 48) return true;
            if (y === 28) return true;
        }
        
        return false;
    }
    
    createEnemies() {
        const enemies = [
            new Robot1028(10 * GAME_CONFIG.TILE_SIZE, 6 * GAME_CONFIG.TILE_SIZE),
            new Ratuile(30 * GAME_CONFIG.TILE_SIZE, 12 * GAME_CONFIG.TILE_SIZE),
            new Slimer(40 * GAME_CONFIG.TILE_SIZE, 8 * GAME_CONFIG.TILE_SIZE),
            new Robot1028(15 * GAME_CONFIG.TILE_SIZE, 20 * GAME_CONFIG.TILE_SIZE),
            new Ratuile(40 * GAME_CONFIG.TILE_SIZE, 25 * GAME_CONFIG.TILE_SIZE),
            new Slimer(25 * GAME_CONFIG.TILE_SIZE, 30 * GAME_CONFIG.TILE_SIZE)
        ];
        
        return enemies;
    }
    
    createAllies() {
        return [
            new TecnPlayer(5 * GAME_CONFIG.TILE_SIZE, 5 * GAME_CONFIG.TILE_SIZE)
        ];
    }
    
    getDialogs() {
        return [
            { speaker: '📺 Tecno Player', text: '¡Hola! Soy Tecno Player. Te ayudaré a escapar.' },
            { speaker: '📺 Tecno Player', text: '¡Cuidado! Hay monstruos por aquí.' },
            { speaker: '🤖 1028', text: '¡Hola! Puedo ayudarte... 🤖' },
            { speaker: 'Sistema', text: 'ADVERTENCIA: 1028 puede traicionarte. ¡Cuidado!' },
            { speaker: '📺 Tecno Player', text: '¡ Detectado! 1028 tiene probabilidad de traición del 70%!' }
        ];
    }
}