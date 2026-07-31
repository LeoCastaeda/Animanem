/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Se inicializará en la primera interacción del usuario
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn("Web Audio API no está soportada en este navegador:", e);
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  private playTone(freqs: number[], durations: number[], type: OscillatorType = 'sine', gainVal = 0.1) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    
    // Reactivar el contexto si el navegador lo suspendió
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    let time = now;

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      
      gainNode.gain.setValueAtTime(gainVal, time);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + durations[idx]);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + durations[idx]);
      
      time += durations[idx] * 0.85; // Ligera superposición para melodías más fluidas
    });
  }

  playClick() {
    this.playTone([600], [0.06], 'sine', 0.04);
  }

  playHit() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playHeal() {
    // Arpegio ascendente mágico
    this.playTone([261.63, 329.63, 392.00, 523.25, 659.25], [0.08, 0.08, 0.08, 0.08, 0.2], 'triangle', 0.08);
  }

  playItem() {
    // Destello de burbuja mágica
    this.playTone([587.33, 698.46, 880.00, 1174.66], [0.07, 0.07, 0.07, 0.15], 'sine', 0.06);
  }

  playAscension() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(550, now + 1.0);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(111, now);
    osc2.frequency.linearRampToValueAtTime(552, now + 1.0);
    
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.0);
    osc2.stop(now + 1.0);
  }

  playVictory() {
    // Fanfarria heroica alegre
    this.playTone([392.00, 392.00, 392.00, 523.25, 659.25, 783.99], [0.1, 0.1, 0.1, 0.15, 0.15, 0.4], 'triangle', 0.1);
  }

  playDefeat() {
    // Tono descendente y melancólico
    this.playTone([220.00, 196.00, 174.61, 146.83], [0.2, 0.2, 0.2, 0.5], 'sawtooth', 0.08);
  }

  playLevelUp() {
    this.playTone([261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25, 783.99], [0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.3], 'sine', 0.08);
  }

  playEvent() {
    // Sonido al encontrar un cofre o altar
    this.playTone([440.00, 554.37, 659.25, 880.00], [0.08, 0.08, 0.08, 0.2], 'triangle', 0.07);
  }
}

export const soundManager = new SoundManager();
