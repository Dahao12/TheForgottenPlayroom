// Chapter 3 Level - The Laboratory
class Chapter3 extends Level {
    constructor() {
        super(3, 'Capítulo 3: El Laboratorio');
    }
    
    generate() {
        const map = [];
        
        for (let y = 0; y < 40; y++) {
            const row = [];
            for (let x = 0; x < 60; x++) {
                if (x === 0 || x === 59 || y === 0 || y === 39) {
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
        map[37][57] = TILES.END_ZONE;
        
        // Doors (more locked)
        for (let i = 0; i < 8; i++) {
            const dx = Math.floor(Math.random() * 50) + 5;
            const dy = Math.floor(Math.random() * 30) + 5;
            map[dy][dx] = TILES.DOOR;
        }
        
        // Items
        for (let i = 0; i < 10; i++) {
            const ix = Math.floor(Math.random() * 50) + 5;
            const iy = Math.floor(Math.random() * 30) + 5;
            if (map[iy][ix] === TILES.FLOOR) {
                map[iy][ix] = TILES.ITEM;
            }
        }
        
        // Enemy spawns - ALL monsters
        map[5][15] = TILES.ENEMY_SPAWN;
        map[10][30] = TILES.ENEMY_SPAWN;
        map[15][45] = TILES.ENEMY_SPAWN;
        map[20][10] = TILES.ENEMY_SPAWN;
        map[25][35] = TILES.ENEMY_SPAWN;
        map[30][20] = TILES.ENEMY_SPAWN;
        map[35][50] = TILES.ENEMY_SPAWN;
        
        return map;
    }
    
    generateRoom(x, y) {
        // Complex lab layout
        if (y >= 3 && y <= 12 && x >= 5 && x <= 25) {
            if (x === 5 || x === 25) return true;
            if (y === 3 || y === 12) return true;
        }
        
        if (y >= 3 && y <= 12 && x >= 30 && x <= 55) {
            if (x === 30 || x === 55) return true;
            if (y === 3 || y === 12) return true;
        }
        
        if (y >= 15 && y <= 28 && x >= 5 && x <= 35) {
            if (x === 5 || x === 35) return true;
            if (y === 15 || y === 28) return true;
            if (x === 15 || x === 25) return y >= 18 && y <= 25;
        }
        
        if (y >= 30 && y <= 38 && x >= 15 && x <= 55) {
            if (x === 15 || x === 55) return true;
            if (y === 30) return true;
        }
        
        return false;
    }
    
    createEnemies() {
        // Mix of all monsters from chapters 1 and 2
        const enemies = [
            new Boogo(15 * GAME_CONFIG.TILE_SIZE, 5 * GAME_CONFIG.TILE_SIZE),
            new Catstar(30 * GAME_CONFIG.TILE_SIZE, 10 * GAME_CONFIG.TILE_SIZE),
            new Robot1028(45 * GAME_CONFIG.TILE_SIZE, 15 * GAME_CONFIG.TILE_SIZE),
            new Ratuile(10 * GAME_CONFIG.TILE_SIZE, 20 * GAME_CONFIG.TILE_SIZE),
            new Slimer(35 * GAME_CONFIG.TILE_SIZE, 25 * GAME_CONFIG.TILE_SIZE),
            new Boogo(20 * GAME_CONFIG.TILE_SIZE, 30 * GAME_CONFIG.TILE_SIZE),
            new Catstar(50 * GAME_CONFIG.TILE_SIZE, 35 * GAME_CONFIG.TILE_SIZE)
        ];
        
        return enemies;
    }
    
    getDialogs() {
        return [
            { speaker: 'Sistema', text: 'Capítulo 3: El Laboratorio' },
            { speaker: 'Sistema', text: 'Has descubierto los secretos de la fábrica...' },
            { speaker: '👧 Emily', text: '¿Sigues aquí? ¡Qué lindo!' },
            { speaker: '👧 Emily', text: 'Mis amigos te estaban buscando...' },
            { speaker: 'Sistema', text: 'ADVERTENCIA: Todos los monstruos están activos' },
            { speaker: '📺 Tecno Player', text: '¡Detectado! ¡Múltiples entidades hostiles!' }
        ];
    }
}