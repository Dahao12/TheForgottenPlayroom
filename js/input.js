// Input Handler
class InputHandler {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, clicked: false };
        this.previousKeys = {};
        
        // Bind events immediately
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Mouse events
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        
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
        
        console.log('✅ InputHandler initialized');
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
        // Prevent default for game keys
        if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyF', 'Space', 'Escape', 
             'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    handleMouseDown(e) {
        this.mouse.clicked = true;
    }
    
    handleMouseUp(e) {
        this.mouse.clicked = false;
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    wasKeyJustPressed(keyCode) {
        return this.keys[keyCode] === true && this.previousKeys[keyCode] !== true;
    }
    
    // Alias for compatibility
    wasKeyJustPress(keyCode) {
        return this.wasKeyJustPressed(keyCode);
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
    
    // Simulate a key press (for mobile controls)
    simulateKey(keyCode) {
        this.keys[keyCode] = true;
        setTimeout(() => {
            this.keys[keyCode] = false;
        }, 100);
    }
    
    update() {
        this.previousKeys = { ...this.keys };
    }
    
    reset() {
        this.keys = {};
        this.mouse.clicked = false;
    }
}