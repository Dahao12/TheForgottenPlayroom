// Chapter 4 Level - Emily's Playroom (Final Boss)
class Chapter4 extends Level {
    constructor() {
        super(4, 'Capítulo 4: La Sala de Emily');
        this.emily = null;
        this.victoryCondition = false;
        this.toysPlaced = 0;
        this.maxToys = 5;
    }
    
    generate() {
        // Single large room with toy theme
        const map = [];
        
        const width = 30;
        const height = 25;
        
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // Border
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    row.push(TILES.WALL);
                }
                // Decorative walls inside
                else if (this.generateDecorations(x, y)) {
                    row.push(TILES.WALL);
                }
                else {
                    row.push(TILES.FLOOR);
                }
            }
            map.push(row);
        }
        
        // Player spawn
        map[height - 3][3] = TILES.SPAWN;
        
        // Items (toys to place)
        map[5][10] = TILES.ITEM;
        map[5][15] = TILES.ITEM;
        map[5][20] = TILES.ITEM;
        map[5][25] = TILES.ITEM;
        
        // Boss spawn (center)
        map[12][15] = TILES.ENEMY_SPAWN; // Emily
        
        // Minion spawns
        map[8][8] = TILES.ENEMY_SPAWN;
        map[8][22] = TILES.ENEMY_SPAWN;
        map[16][8] = TILES.ENEMY_SPAWN;
        map[16][22] = TILES.ENEMY_SPAWN;
        
        return map;
    }
    
    generateDecorations(x, y) {
        // Stage at top center
        if (y >= 2 && y <= 6 && x >= 12 && x <= 18) {
            return x === 12 || x === 18 || y === 2;
        }
        
        // Toy shelves on sides
        if (y >= 8 && y <= 18 && (x === 3 || x === width - 4)) {
            return true;
        }
        
        return false;
    }
    
    createEnemies() {
        // Emily is the main boss
        this.emily = new Emily(15 * GAME_CONFIG.TILE_SIZE, 12 * GAME_CONFIG.TILE_SIZE);
        
        // Minion spawns
        const enemies = [
            this.emily,
            new Boogo(8 * GAME_CONFIG.TILE_SIZE, 8 * GAME_CONFIG.TILE_SIZE),
            new Catstar(22 * GAME_CONFIG.TILE_SIZE, 8 * GAME_CONFIG.TILE_SIZE),
            new Robot1028(8 * GAME_CONFIG.TILE_SIZE, 16 * GAME_CONFIG.TILE_SIZE),
            new Slimer(22 * GAME_CONFIG.TILE_SIZE, 16 * GAME_CONFIG.TILE_SIZE)
        ];
        
        return enemies;
    }
    
    update(deltaTime, player, audio) {
        super.update(deltaTime, player, audio);
        
        // Check win condition
        if (this.emily && !this.emily.isAlive) {
            this.victoryCondition = true;
        }
    }
    
    getDialogs() {
        return [
            { speaker: '👧 Emily', text: '¡Bienvenido a mi sala de juegos!' },
            { speaker: '👧 Emily', text: 'Todos mis amigos están aquí...' },
            { speaker: '👧 Emily', text: '¡Y ahora tú también te quedarás!' },
            { speaker: '👧 Emily', text: '¿O acaso creíste que yo te estaba ayudando?' },
            { speaker: '👧 Emily', text: '¡Yo controlo TODO aquí!' },
            { speaker: '📺 Tecno Player', text: '¡Detectado! Emily es la entidad principal.' },
            { speaker: '📺 Tecno Player', text: '¡Debes derrotarla para escapar!' },
            { speaker: 'Sistema', text: 'BOSS FINAL: Emily' },
            { speaker: 'Sistema', text: '¡Derrota a Emily para completar el juego!' }
        ];
    }
    
    checkVictory() {
        return this.victoryCondition;
    }
}