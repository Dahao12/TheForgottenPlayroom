// Input Handler
class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        this.previousKeys = {};
        
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('mousedown', (e) => {
            this.mouse.clicked = true;
        });
        
        window.addEventListener('mouseup', (e) => {
            this.mouse.clicked = false;
        });
        
        // Touch events for mobile
        window.addEventListener('touchstart', (e) => {
            this.mouse.clicked = true;
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });
        
        window.addEventListener('touchend', () => {
            this.mouse.clicked = false;
        });
        
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    wasKeyJustPressed(keyCode) {
        return this.keys[keyCode] === true && this.previousKeys[keyCode] !== true;
    }
    
    isMoving() {
        return this.isKeyPressed(KEYS.W) || 
               this.isKeyPressed(KEYS.A) || 
               this.isKeyPressed(KEYS.S) || 
               this.isKeyPressed(KEYS.D) ||
               this.isKeyPressed(KEYS.ARROW_UP) ||
               this.isKeyPressed(KEYS.ARROW_DOWN) ||
               this.isKeyPressed(KEYS.ARROW_LEFT) ||
               this.isKeyPressed(KEYS.ARROW_RIGHT);
    }
    
    getMovementDirection() {
        let dx = 0;
        let dy = 0;
        
        if (this.isKeyPressed(KEYS.W) || this.isKeyPressed(KEYS.ARROW_UP)) dy -= 1;
        if (this.isKeyPressed(KEYS.S) || this.isKeyPressed(KEYS.ARROW_DOWN)) dy += 1;
        if (this.isKeyPressed(KEYS.A) || this.isKeyPressed(KEYS.ARROW_LEFT)) dx -= 1;
        if (this.isKeyPressed(KEYS.D) || this.isKeyPressed(KEYS.ARROW_RIGHT)) dx += 1;
        
        return normalize(dx, dy);
    }
    
    update() {
        this.previousKeys = { ...this.keys };
    }
    
    reset() {
        this.keys = {};
        this.mouse.clicked = false;
    }
}