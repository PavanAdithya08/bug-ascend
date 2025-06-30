export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    this.initAudio();
  }

  private async initAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.enabled = false;
    }
  }

  private async ensureAudioContext(): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  public async playShoot(): Promise<void> {
    if (!this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  public async playExplosion(): Promise<void> {
    if (!this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const noiseGain = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    oscillator.connect(filterNode);
    filterNode.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filterNode.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);

    noiseGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  public async playPowerUp(): Promise<void> {
    if (!this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    // Create multiple oscillators for a richer power-up sound
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode1 = this.audioContext.createGain();
    const gainNode2 = this.audioContext.createGain();

    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);
    gainNode1.connect(this.masterGain);
    gainNode2.connect(this.masterGain);

    // First oscillator - main tone
    oscillator1.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
    
    // Second oscillator - harmony
    oscillator2.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);

    gainNode1.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    gainNode2.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator1.start(this.audioContext.currentTime);
    oscillator1.stop(this.audioContext.currentTime + 0.3);
    
    oscillator2.start(this.audioContext.currentTime);
    oscillator2.stop(this.audioContext.currentTime + 0.3);
  }

  public async playHit(): Promise<void> {
    if (!this.enabled) return;
    await this.ensureAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public toggle(): void {
    this.enabled = !this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}