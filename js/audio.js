// Audio Manager for sound effects and music
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.muted = false;
        
        this.loadSounds();
    }
    
    loadSounds() {
        // Footsteps
        this.sounds.footstep = this.createBeep(200, 0.05);
        
        // Ambience
        this.sounds.ambient = this.createNoise(0.1);
        
        // Jumpscare
        this.sounds.jumpscare = this.createBeep(800, 0.3);
        
        // Heartbeat
        this.sounds.heartbeat = this.createHeartbeat();
        
        // Pickup
        this.sounds.pickup = this.createBeep(600, 0.1);
        
        // Door
        this.sounds.door = this.createBeep(300, 0.15);
        
        // Damage
        this.sounds.damage = this.createBeep(150, 0.2);
        
        // Death
        this.sounds.death = this.createBeep(100, 0.5);
        
        // Victory
        this.sounds.victory = this.createBeep(880, 0.2);
        
        // Monster sounds
        this.sounds.boogo_whisper = this.createWhisper();
        this.sounds.catstar_hiss = this.createBeep(500, 0.15);
        this.sounds.robot_beep = this.createBeep(1000, 0.05);
        this.sounds.rat_squeak = this.createBeep(1200, 0.05);
        this.sounds.slime_gurgle = this.createBeep(100, 0.2);
        this.sounds.tecno_beep = this.createBeep(1500, 0.05);
        this.sounds.emily_laugh = this.createLaugh();
    }
    
    createBeep(frequency, duration) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        return {
            play: () => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.frequency.value = frequency;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
                
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + duration);
            }
        };
    }
    
    createHeartbeat() {
        return {
            play: () => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                // Two beats
                for (let i = 0; i < 2; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.frequency.value = 60;
                    osc.type = 'sine';
                    
                    const startTime = ctx.currentTime + (i * 0.2);
                    gain.gain.setValueAtTime(this.sfxVolume * 0.3, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
                    
                    osc.start(startTime);
                    osc.stop(startTime + 0.1);
                }
            }
        };
    }
    
    createWhisper() {
        return {
            play: () => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const bufferSize = ctx.sampleRate * 0.5;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.1;
                }
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 500;
                
                const gain = ctx.createGain();
                gain.gain.value = this.sfxVolume * 0.3;
                
                source.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                
                source.start();
            }
        };
    }
    
    createLaugh() {
        return {
            play: () => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                
                for (let i = 0; i < 5; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.frequency.value = 600 + (i * 100);
                    osc.type = 'sine';
                    
                    const startTime = ctx.currentTime + (i * 0.1);
                    gain.gain.setValueAtTime(this.muted ? 0 : this.sfxVolume * 0.2, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
                    
                    osc.start(startTime);
                    osc.stop(startTime + 0.1);
                }
            }
        };
    }
    
    createNoise(duration) {
        return {
            play: () => {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const bufferSize = ctx.sampleRate * duration;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.05;
                }
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                
                const gain = ctx.createGain();
                gain.gain.value = this.muted ? 0 : this.musicVolume * 0.2;
                
                source.connect(gain);
                gain.connect(ctx.destination);
                
                source.start();
            }
        };
    }
    
    play(soundName) {
        if (this.muted) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            try {
                sound.play();
            } catch (e) {
                console.log('Audio error:', e);
            }
        }
    }
    
    playMusic(musicName) {
        this.stopMusic();
        const music = this.music[musicName];
        if (music) {
            this.currentMusic = music;
            music.play();
        }
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }
    
    setVolume(type, volume) {
        if (type === 'music') {
            this.musicVolume = Math.clamp(volume, 0, 1);
        } else if (type === 'sfx') {
            this.sfxVolume = Math.clamp(volume, 0, 1);
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        }
    }
}