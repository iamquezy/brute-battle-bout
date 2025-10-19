// Simple sound effects using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playSwordSlash() {
  // Enhanced metallic sword slash
  const ctx = getAudioContext();
  
  // Initial strike with metallic resonance
  playTone(900, 0.08, 'square', 0.25);
  setTimeout(() => playTone(600, 0.12, 'sawtooth', 0.2), 40);
  setTimeout(() => playTone(350, 0.15, 'triangle', 0.15), 80);
  setTimeout(() => playTone(200, 0.18, 'sine', 0.08), 130);
  
  // Add metallic ring
  setTimeout(() => {
    playTone(1400, 0.15, 'sine', 0.12);
    playTone(2800, 0.12, 'sine', 0.08);
  }, 60);
}

export function playBowShot() {
  // Enhanced bow and arrow sound
  const ctx = getAudioContext();
  
  // Bow string tension and snap
  playTone(120, 0.04, 'triangle', 0.28);
  setTimeout(() => playTone(180, 0.05, 'square', 0.25), 30);
  
  // Arrow whoosh with doppler effect
  setTimeout(() => {
    playTone(700, 0.25, 'sine', 0.18);
    setTimeout(() => playTone(500, 0.2, 'sine', 0.14), 80);
    setTimeout(() => playTone(350, 0.15, 'sine', 0.10), 150);
  }, 60);
  
  // Air cutting sound
  setTimeout(() => {
    playTone(2000, 0.15, 'sine', 0.08);
  }, 70);
}

export function playSpellCast() {
  // Enhanced magical spell sound
  const ctx = getAudioContext();
  
  // Building magical energy
  playTone(300, 0.15, 'sine', 0.22);
  setTimeout(() => playTone(500, 0.15, 'triangle', 0.25), 80);
  setTimeout(() => playTone(700, 0.18, 'sine', 0.23), 160);
  setTimeout(() => playTone(900, 0.2, 'triangle', 0.26), 240);
  
  // Spell release with sparkles
  setTimeout(() => {
    playTone(1400, 0.25, 'sine', 0.20);
    playTone(1800, 0.22, 'sine', 0.15);
    playTone(2200, 0.18, 'triangle', 0.12);
  }, 320);
  
  // Magical shimmer
  setTimeout(() => {
    playTone(2800, 0.15, 'sine', 0.10);
    playTone(3200, 0.12, 'sine', 0.08);
  }, 400);
}

export function playHitSound() {
  // Impact sound
  playTone(100, 0.1, 'square', 0.3);
  setTimeout(() => playTone(80, 0.15, 'sawtooth', 0.2), 50);
}

export function playCriticalHit() {
  // Powerful critical hit
  playTone(1200, 0.1, 'square', 0.35);
  setTimeout(() => playTone(600, 0.15, 'sawtooth', 0.3), 50);
  setTimeout(() => playTone(300, 0.2, 'square', 0.25), 100);
}

export function playVictory() {
  // Victory fanfare
  playTone(523, 0.2, 'sine', 0.25); // C
  setTimeout(() => playTone(659, 0.2, 'sine', 0.25), 200); // E
  setTimeout(() => playTone(784, 0.4, 'sine', 0.3), 400); // G
}

export function playDefeat() {
  // Defeat sound
  playTone(400, 0.3, 'sawtooth', 0.25);
  setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.2), 200);
  setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.15), 400);
}
