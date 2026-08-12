class SoundEffectsService {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }

  playSuccess() {
    this.playTone(523.25, 'sine', 0.1, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.15), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.18), 200); // G5
  }

  playError() {
    this.playTone(220, 'triangle', 0.2, 0.15); // A3
    setTimeout(() => this.playTone(196, 'triangle', 0.25, 0.15), 150); // G3
  }

  playClick() {
    this.playTone(800, 'sine', 0.04, 0.05);
  }

  toggleSound(state) {
    this.enabled = typeof state === 'boolean' ? state : !this.enabled;
    return this.enabled;
  }
}

export const soundEffectsService = new SoundEffectsService();
