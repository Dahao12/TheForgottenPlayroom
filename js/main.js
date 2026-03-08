// Main Entry Point
// The Forgotten Playroom - HTML5 Horror Game

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 The Forgotten Playroom - Starting...');
    
    // Game initialization happens in game.js
    // This file is for additional setup
    
    // Prevent context menu on right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Handle visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && window.game && window.game.state === GAME_STATES.PLAYING) {
            window.game.pause();
        }
    });
    
    // Button handlers
    document.getElementById('btn-start')?.addEventListener('click', () => {
        window.game?.handleStartGame();
    });
    
    document.getElementById('btn-continue')?.addEventListener('click', () => {
        window.game?.handleContinue();
    });
    
    document.getElementById('btn-settings')?.addEventListener('click', () => {
        window.game?.handleSettings();
    });
    
    document.getElementById('btn-quit')?.addEventListener('click', () => {
        window.game?.handleQuit();
    });
    
    document.getElementById('btn-restart')?.addEventListener('click', () => {
        window.game?.handleRestart();
    });
    
    document.getElementById('btn-main-menu')?.addEventListener('click', () => {
        window.game?.handleMainMenu();
    });
    
    // Settings handlers
    document.getElementById('settings-back')?.addEventListener('click', () => {
        document.getElementById('settings-screen').classList.add('hidden');
    });
    
    // Volume sliders
    const sfxVolume = document.getElementById('sfx-volume');
    const musicVolume = document.getElementById('music-volume');
    
    sfxVolume?.addEventListener('input', (e) => {
        if (window.game?.audio) {
            window.game.audio.setVolume('sfx', e.target.value / 100);
        }
    });
    
    musicVolume?.addEventListener('input', (e) => {
        if (window.game?.audio) {
            window.game.audio.setVolume('music', e.target.value / 100);
        }
    });
    
    // Mute toggle
    document.getElementById('mute-toggle')?.addEventListener('click', () => {
        if (window.game?.audio) {
            window.game.audio.toggleMute();
            document.getElementById('mute-toggle').textContent = 
                window.game.audio.muted ? '🔇' : '🔊';
        }
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Minimum swipe distance
        const minSwipe = 30;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > minSwipe) {
                window.game?.input?.simulateKey(KEYS.RIGHT);
            } else if (deltaX < -minSwipe) {
                window.game?.input?.simulateKey(KEYS.LEFT);
            }
        } else {
            // Vertical swipe
            if (deltaY > minSwipe) {
                window.game?.input?.simulateKey(KEYS.DOWN);
            } else if (deltaY < -minSwipe) {
                window.game?.input?.simulateKey(KEYS.UP);
            }
        }
    });
    
    // Double tap for flashlight
    let lastTap = 0;
    document.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            window.game?.input?.simulateKey(KEYS.F);
            e.preventDefault();
        }
        
        lastTap = currentTime;
    });
    
    console.log('✅ Game initialized successfully');
});

// Utility functions for mobile buttons
function simulateKeyPress(key) {
    window.game?.input?.simulateKey(key);
}

function togglePause() {
    window.game?.pause();
}

function interact() {
    window.game?.input?.simulateKey(KEYS.E);
}

function toggleFlashlight() {
    window.game?.input?.simulateKey(KEYS.F);
}