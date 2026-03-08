// Utility Functions

Math.lerp = function(start, end, t) {
    return start + (end - start) * t;
};

Math.clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
};

Math.randomRange = function(min, max) {
    return Math.random() * (max - min) + min;
};

Math.randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Check if point is inside rectangle
function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// Check if point is inside circle
function pointInCircle(px, py, cx, cy, radius) {
    return distance(px, py, cx, cy) <= radius;
}

// Normalize vector
function normalize(x, y) {
    const len = Math.sqrt(x * x + y * y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: x / len, y: y / len };
}

// Angle between two points
function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

// Convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Draw circle
function drawCircle(ctx, x, y, radius, color, stroke = false, lineWidth = 2) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (stroke) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    } else {
        ctx.fillStyle = color;
        ctx.fill();
    }
}

// Draw rectangle
function drawRect(ctx, x, y, width, height, color, stroke = false, lineWidth = 2) {
    if (stroke) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, width, height);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }
}

// Draw text
function drawText(ctx, text, x, y, color = '#ffffff', font = '16px Arial', align = 'center') {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

// Draw emoji entity
function drawEmoji(ctx, emoji, x, y, size) {
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
}

// Create gradient for flashlight effect
function createFlashlightGradient(ctx, x, y, radius) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    return gradient;
}

// Create darkness overlay
function createDarknessOverlay(ctx, canvasWidth, canvasHeight) {
    return ctx.createRadialGradient(
        canvasWidth / 2, canvasHeight / 2, 50,
        canvasWidth / 2, canvasHeight / 2, canvasWidth / 2
    );
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Check line of sight (for enemy detection)
function hasLineOfSight(x1, y1, x2, y2, tiles, tileSize) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) / tileSize;
    
    for (let i = 0; i <= steps; i++) {
        const x = x1 + (dx * i / steps);
        const y = y1 + (dy * i / steps);
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);
        
        if (tiles[tileY] && tiles[tileY][tileX] === TILES.WALL) {
            return false;
        }
    }
    
    return true;
}

// Simple A* pathfinding (simplified for web game)
function findPath(startX, startY, endX, endY, tiles) {
    // Simplified pathfinding - direct line with wall check
    const path = [];
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 5) return path;
    
    const steps = Math.ceil(dist / 10);
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    for (let i = 0; i <= steps; i++) {
        path.push({
            x: startX + stepX * i,
            y: startY + stepY * i
        });
    }
    
    return path;
}

// Random position in room
function getRandomPosition(tiles, tileSize, type = TILES.FLOOR) {
    const positions = [];
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[y].length; x++) {
            if (tiles[y][x] === type) {
                positions.push({
                    x: x * tileSize + tileSize / 2,
                    y: y * tileSize + tileSize / 2
                });
            }
        }
    }
    return positions[Math.floor(Math.random() * positions.length)];
}

// Check collision with tiles
function checkTileCollision(x, y, width, height, tiles, tileSize) {
    const left = Math.floor(x / tileSize);
    const right = Math.floor((x + width) / tileSize);
    const top = Math.floor(y / tileSize);
    const bottom = Math.floor((y + height) / tileSize);
    
    for (let ty = top; ty <= bottom; ty++) {
        for (let tx = left; tx <= right; tx++) {
            if (tiles[ty] && tiles[ty][tx] === TILES.WALL) {
                return true;
            }
        }
    }
    return false;
}