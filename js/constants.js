// Game Constants
const GAME_CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // Player
    PLAYER_SPEED: 3,
    PLAYER_RUN_SPEED: 5,
    PLAYER_MAX_HEALTH: 100,
    PLAYER_MAX_STAMINA: 100,
    STAMINA_DRAIN: 0.5,
    STAMINA_REGEN: 0.3,
    
    // Flashlight
    FLASHLIGHT_RADIUS: 200,
    FLASHLIGHT_BATTERY_MAX: 100,
    FLASHLIGHT_BATTERY_DRAIN: 0.1,
    FLASHLIGHT_RECHARGE: 0.05,
    
    // Tile size
    TILE_SIZE: 32,
    
    // Colors
    COLORS: {
        BACKGROUND: '#0a0a0a',
        FLOOR: '#1a1a1a',
        WALL: '#333333',
        PLAYER: '#00aaff',
        FLASHLIGHT: 'rgba(255, 255, 200, 0.1)',
        DARKNESS: 'rgba(0, 0, 0, 0.95)',
        ENEMY_BOOGO: '#8B4513',
        ENEMY_CATSTAR: '#FFD700',
        ENEMY_ROBOT: '#666666',
        ENEMY_RATUILE: '#8B8B8B',
        ENEMY_SLIMER: '#00AA00',
        ALLY_TECNO: '#00FFFF',
        BOSS_EMILY: '#FF00FF',
        ITEM: '#FFFF00',
        DOOR: '#8B4513',
        HIDDEN_ZONE: '#111111'
    },
    
    // Game States
    STATES: {
        MENU: 'menu',
        LOADING: 'loading',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        VICTORY: 'victory',
        DIALOG: 'dialog',
        CUTSCENE: 'cutscene'
    },
    
    // Enemy Behaviors
    BOOGO_TELEPORT_COOLDOWN: 5000,
    BOOGO_TELEPORT_RANGE: [100, 200],
    CATSTAR_LEAP_RANGE: 150,
    ROBOT_BETRAYAL_CHANCE: 0.7,
    RATUILE_EMOTION_DURATION: 30000,
    SLIMER_SLOW_AMOUNT: 0.5,
    TECNO_HEALING_RANGE: 50,
    
    // Chapter Names
    CHAPTERS: {
        1: 'Capítulo 1: La Entrada',
        2: 'Capítulo 2: El Almacén',
        3: 'Capítulo 3: El Laboratorio',
        4: 'Capítulo 4: La Sala de Emily'
    }
};

// Character Types
const CHARACTER_TYPES = {
    PLAYER: 'player',
    BOOGO: 'boogo',
    CATSTAR: 'catstar',
    ROBOT1028: 'robot1028',
    RATUILE: 'ratuile',
    SLIMER: 'slimer',
    TECNO: 'tecnoplayer',
    EMILY: 'emily'
};

// Emotion Types for Ratuile
const EMOTIONS = {
    HAPPY: 'happy',
    SAD: 'sad',
    ANGRY: 'angry'
};

// Tile Types
const TILES = {
    EMPTY: 0,
    FLOOR: 1,
    WALL: 2,
    DOOR: 3,
    ITEM: 4,
    SPAWN: 5,
    ENEMY_SPAWN: 6,
    END_ZONE: 7,
    HIDDEN_ZONE: 8
};

// Key Codes
const KEYS = {
    W: 'KeyW',
    A: 'KeyA',
    S: 'KeyS',
    D: 'KeyD',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    F: 'KeyF',
    E: 'KeyE',
    SPACE: 'Space',
    ESCAPE: 'Escape',
    I: 'KeyI'
};

// Direction Vectors
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

// Messages
const MESSAGES = {
    BOOGO_WHISPER: "Emily...",
    ROBOT_BETRAY: "¡ERROR! ¡ELIMINAR!",
    TECNO_GREET: "¡Hola! Soy Tecno Player. Te ayudaré a escapar.",
    TECNO_DANGER: "¡PELIGRO! ¡Enemigo cerca!",
    EMILY_INTRO: "Hola... ¿También quieres jugar conmigo?",
    EMILY_REVEAL: "¡Todos mis juguetes... son míos para siempre!",
    GAME_OVER_BOOGO: "Te atrapó Boogo...",
    GAME_OVER_CATSTAR: "Catstar te atacó desde las sombras...",
    GAME_OVER_ROBOT: "1028 te traicionó...",
    GAME_OVER_RATUILE: "Ratuile te mordió cuando estaba furioso...",
    GAME_OVER_SLIMER: "Slimer te absorbió...",
    GAME_OVER_EMILY: "Emily decidió quedarte... para siempre."
};

// Death Messages by Monster
const DEATH_MESSAGES = {
    [CHARACTER_TYPES.BOOGO]: {
        message: "Sentiste un frío detrás de ti...",
        monster: "Boogo se teletransportó directamente detrás de ti"
    },
    [CHARACTER_TYPES.CATSTAR]: {
        message: "Un sonido metálico arriba...",
        monster: "Catstar saltó desde las sombras"
    },
    [CHARACTER_TYPES.ROBOT1028]: {
        message: "Ojos rojos brillaron...",
        monster: "1028 reveló sus pinzas de acero"
    },
    [CHARACTER_TYPES.RATUILE]: {
        message: "Una cara furiosa apareció...",
        monster: "Ratuile te mordió sin piedad"
    },
    [CHARACTER_TYPES.SLIMER]: {
        message: "Un rastro viscoso en el suelo...",
        monster: "Slimer te absorbió en su masa"
    },
    [CHARACTER_TYPES.EMILY]: {
        message: "Una risa infantil resonó...",
        monster: "Emily decidió que te quedarás para siempre"
    }
};