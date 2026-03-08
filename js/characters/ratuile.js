// Ratuile - Chapter 2 Monster
// Rat with 3 emotions: Happy, Sad, Angry
class Ratuile extends Enemy {
    constructor(x, y) {
        super(x, y, CHARACTER_TYPES.RATUILE);
        
        this.emoji = '🐀';
        this.color = '#8B8B8B';
        
        this.speed = 2;
        this.chaseSpeed = 6; // Fast when angry
        
        this.currentEmotion = EMOTIONS.HAPPY;
        this.emotionTimer = 0;
        this.emotionDuration = 30000; // 30 seconds per emotion
        
        this.emotionSpeed = {
            [EMOTIONS.HAPPY]: 1.5,
            [EMOTIONS.SAD]: 2,
            [EMOTIONS.ANGRY]: 6
        };
        
        this.emotionDamage = {
            [EMOTIONS.HAPPY]: 0,
            [EMOTIONS.SAD]: 5,
            [EMOTIONS.ANGRY]: 20
        };
        
        this.maxHealth = 60;
        this.health = this.maxHealth;
        this.damage = 15;
    }
    
    update(deltaTime, player, tiles, tileSize, audio) {
        if (!this.isAlive) return;
        
        // Emotion cycle
        this.emotionTimer += deltaTime;
        if (this.emotionTimer > this.emotionDuration) {
            this.changeEmotion();
            this.emotionTimer = 0;
        }
        
        // Update speed based on emotion
        this.speed = this.emotionSpeed[this.currentEmotion];
        this.chaseSpeed = this.speed;
        
        const distToPlayer = distance(this.x, this.y, player.x, player.y);
        
        // Behavior based on emotion
        switch (this.currentEmotion) {
            case EMOTIONS.HAPPY:
                // Patrol normally, ignore player
                this.patrol(deltaTime, tiles, tileSize);
                break;
                
            case EMOTIONS.SAD:
                // Run away from player
                if (this.canSeePlayer(player, tiles, tileSize)) {
                    const awayDir = normalize(this.x - player.x, this.y - player.y);
                    const newX = this.x + awayDir.x * this.speed * 2;
                    const newY = this.y + awayDir.y * this.speed * 2;
                    
                    if (!checkTileCollision(newX, this.y, this.width, this.height, tiles, tileSize)) {
                        this.x = newX;
                    }
                    if (!checkTileCollision(this.x, newY, this.width, this.height, tiles, tileSize)) {
                        this.y = newY;
                    }
                }
                break;
                
            case EMOTIONS.ANGRY:
                // Aggressive chase
                if (this.canSeePlayer(player, tiles, tileSize)) {
                    this.isChasing = true;
                    this.chase(deltaTime, player.x, player.y, tiles, tileSize);
                    
                    if (distToPlayer <= this.attackRange) {
                        this.tryAttack(player, audio);
                    }
                }
                break;
        }
        
        // Animation
        this.animationTimer += deltaTime;
        if (this.animationTimer > 150) {
            this.animationTimer = 0;
            this.animationFrame = (this.animationFrame + 1) % 4;
        }
    }
    
    changeEmotion() {
        // Cycle: Happy -> Sad -> Angry -> Happy
        switch (this.currentEmotion) {
            case EMOTIONS.HAPPY:
                this.currentEmotion = EMOTIONS.SAD;
                break;
            case EMOTIONS.SAD:
                this.currentEmotion = EMOTIONS.ANGRY;
                break;
            case EMOTIONS.ANGRY:
                this.currentEmotion = EMOTIONS.HAPPY;
                break;
        }
    }
    
    playSound(audio) {
        audio.play('rat_squeak');
    }
    
    onAttack(player, audio) {
        if (this.currentEmotion === EMOTIONS.ANGRY) {
            audio.play('rat_squeak');
        }
    }
    
    drawSprite(ctx) {
        // Draw Ratuile emoji
        drawEmoji(ctx, this.emoji, this.x + this.width / 2, this.y + this.height / 2, 32);
        
        // Draw emotion face
        let emotionFace = '😊';
        let emotionColor = '#ffff00';
        
        switch (this.currentEmotion) {
            case EMOTIONS.HAPPY:
                emotionFace = '😊';
                emotionColor = '#ffff00';
                break;
            case EMOTIONS.SAD:
                emotionFace = '😟';
                emotionColor = '#0000ff';
                break;
            case EMOTIONS.ANGRY:
                emotionFace = '😠';
                emotionColor = '#ff0000';
                break;
        }
        
        // Draw emotion indicator
        drawText(ctx, emotionFace, this.x + this.width / 2, this.y - 10, emotionColor);
        
        // Draw chasing indicator if angry
        if (this.currentEmotion === EMOTIONS.ANGRY && this.isChasing) {
            drawCircle(ctx, this.x + this.width / 2, this.y + this.height / 2, this.sightRange, '#ff0000', true, 1);
        }
    }
}