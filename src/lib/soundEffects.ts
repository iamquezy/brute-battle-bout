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
  // Metallic sword slash sound
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  playTone(800, 0.1, 'square', 0.2);
  setTimeout(() => playTone(400, 0.1, 'square', 0.15), 50);
  setTimeout(() => playTone(200, 0.15, 'sawtooth', 0.1), 100);
}

export function playBowShot() {
  // Bow release and arrow whoosh
  const ctx = getAudioContext();
  
  // Bow string snap
  playTone(150, 0.05, 'triangle', 0.25);
  
  // Arrow whoosh
  setTimeout(() => {
    playTone(600, 0.3, 'sine', 0.15);
    setTimeout(() => playTone(400, 0.2, 'sine', 0.1), 100);
  }, 50);
}

export function playSpellCast() {
  // Magical spell sound
  const ctx = getAudioContext();
  
  // Rising magical tone
  playTone(400, 0.2, 'sine', 0.2);
  setTimeout(() => playTone(600, 0.2, 'sine', 0.25), 100);
  setTimeout(() => playTone(800, 0.3, 'triangle', 0.2), 200);
  setTimeout(() => playTone(1200, 0.2, 'sine', 0.15), 300);
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
