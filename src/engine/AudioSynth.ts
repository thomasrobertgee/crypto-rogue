/**
 * Zero-dependency procedural sound synthesizer (Web Audio API).
 * Lazily creates the AudioContext on first use (must follow a user gesture on iOS).
 */
type Wave = OscillatorType

interface ToneOpts {
  freq: number
  endFreq?: number
  type?: Wave
  duration: number
  volume?: number
  delay?: number
  attack?: number
}

class AudioSynthImpl {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private _muted = false
  private _volume = 0.6

  get muted(): boolean { return this._muted }

  setMuted(m: boolean): void {
    this._muted = m
    if (this.master) this.master.gain.value = m ? 0 : this._volume
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v))
    if (this.master && !this._muted) this.master.gain.value = this._volume
  }

  /** Call from a user gesture to unlock audio on mobile. */
  unlock(): void {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    this.ctx = new Ctor()
    this.master = this.ctx.createGain()
    this.master.gain.value = this._muted ? 0 : this._volume
    const comp = this.ctx.createDynamicsCompressor()
    this.master.connect(comp).connect(this.ctx.destination)
    return this.ctx
  }

  private ready(): AudioContext | null {
    if (this._muted) return null
    const ctx = this.ensure()
    if (ctx?.state === 'suspended') void ctx.resume()
    return ctx
  }

  private tone({ freq, endFreq, type = 'sine', duration, volume = 0.3, delay = 0, attack = 0.005 }: ToneOpts): void {
    const ctx = this.ready()
    if (!ctx || !this.master) return
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(volume, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  }

  private noise(duration: number, volume = 0.2, delay = 0, filterFreq = 2000, filterType: BiquadFilterType = 'lowpass'): void {
    const ctx = this.ready()
    if (!ctx || !this.master) return
    if (!this.noiseBuffer) {
      this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
      const d = this.noiseBuffer.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    }
    const t = ctx.currentTime + delay
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const f = ctx.createBiquadFilter()
    f.type = filterType
    f.frequency.value = filterFreq
    const g = ctx.createGain()
    g.gain.setValueAtTime(volume, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    src.connect(f).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + duration + 0.02)
  }

  /** Short metallic "clink" of a coin dropping into a wallet. */
  playCoinInject(): void {
    this.tone({ freq: 1800, type: 'triangle', duration: 0.08, volume: 0.2 })
    this.tone({ freq: 2600, type: 'sine', duration: 0.15, volume: 0.15, delay: 0.04 })
  }

  /** Bright rising chirp for an Up roll. */
  playGreenCandle(): void {
    this.tone({ freq: 520, endFreq: 1040, type: 'square', duration: 0.12, volume: 0.08 })
    this.tone({ freq: 1040, type: 'sine', duration: 0.18, volume: 0.12, delay: 0.08 })
  }

  /** Low falling thud for a Down roll. */
  playRedDump(): void {
    this.tone({ freq: 300, endFreq: 70, type: 'sawtooth', duration: 0.3, volume: 0.15 })
    this.noise(0.15, 0.1, 0, 400)
  }

  /** Digital blip arpeggio when a relic fires. */
  playRelicTrigger(): void {
    ;[880, 1320, 1760].forEach((f, i) => this.tone({ freq: f, type: 'square', duration: 0.06, volume: 0.07, delay: i * 0.04 }))
  }

  /** Whoosh + major chord shimmer for opening a vault. */
  playChestOpen(): void {
    this.noise(0.4, 0.15, 0, 3000, 'bandpass')
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', duration: 0.5, volume: 0.12, delay: 0.25 + i * 0.06 }))
  }

  /** Epic ascending fanfare with sub-bass hit for a Mythical pull. */
  playMythicalDrop(): void {
    this.tone({ freq: 60, endFreq: 40, type: 'sine', duration: 0.8, volume: 0.4 })
    this.noise(0.6, 0.12, 0, 6000, 'highpass')
    const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => this.tone({ freq: f, type: 'sawtooth', duration: 0.25, volume: 0.06, delay: 0.1 + i * 0.07 }))
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f) =>
      this.tone({ freq: f, type: 'triangle', duration: 1.4, volume: 0.1, delay: 0.65, attack: 0.05 }))
  }

  /** Two-tone siren for boss arrival / hazard. */
  playBossAlarm(): void {
    for (let i = 0; i < 3; i++) {
      this.tone({ freq: 440, endFreq: 880, type: 'sawtooth', duration: 0.25, volume: 0.1, delay: i * 0.5 })
      this.tone({ freq: 880, endFreq: 440, type: 'sawtooth', duration: 0.25, volume: 0.1, delay: i * 0.5 + 0.25 })
    }
  }

  /** Victory fanfare for node / floor completion. */
  playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', duration: 0.45, volume: 0.15, delay: i * 0.08 }),
    )
  }

  /** Margin call liquidation sound. */
  playMarginCall(): void {
    this.tone({ freq: 150, endFreq: 40, type: 'sawtooth', duration: 0.7, volume: 0.25 })
    this.noise(0.5, 0.2, 0.1, 800, 'lowpass')
  }

  /** Fanfare for rare loot or winning prediction */
  playRareLootFanfare(): void {
    this.playVictory()
  }

  /** Wind / speed whoosh for highway traversal */
  playWhoosh(): void {
    this.noise(0.35, 0.12, 0, 1600, 'bandpass')
    this.tone({ freq: 280, endFreq: 110, type: 'sine', duration: 0.35, volume: 0.12 })
  }

  /** Rhythmic running footstep tap on the cyber highway */
  playFootstep(): void {
    this.noise(0.03, 0.04, 0, 1000, 'lowpass')
    this.tone({ freq: 140, endFreq: 80, type: 'triangle', duration: 0.04, volume: 0.05 })
  }

  /** Tactical cyber radar lock-on acquisition chime */
  playTargetLockOn(): void {
    this.tone({ freq: 1320, type: 'sine', duration: 0.06, volume: 0.14 })
    this.tone({ freq: 1760, type: 'square', duration: 0.09, volume: 0.12, delay: 0.06 })
    this.tone({ freq: 2640, type: 'sine', duration: 0.14, volume: 0.1, delay: 0.12 })
  }

  /** Studio splash fanfare: rolling percussive thud + two-note chime (G5 -> C6) with sparkle shimmer. */
  playGeeGamesFanfare(): void {
    // Letter entrance roll & impact thud
    this.noise(0.12, 0.08, 0, 1800, 'bandpass')
    this.tone({ freq: 220, endFreq: 440, type: 'triangle', duration: 0.1, volume: 0.15, delay: 0.05 })

    // Note 1: G5 (783.99 Hz)
    this.tone({ freq: 783.99, type: 'triangle', duration: 0.35, volume: 0.22, delay: 0.18, attack: 0.01 })
    this.tone({ freq: 1567.98, type: 'sine', duration: 0.25, volume: 0.1, delay: 0.2 })

    // Note 2: C6 (1046.50 Hz) - big triumphant chime
    this.tone({ freq: 1046.5, type: 'triangle', duration: 0.9, volume: 0.28, delay: 0.5, attack: 0.01 })
    this.tone({ freq: 2093.0, type: 'sine', duration: 0.7, volume: 0.12, delay: 0.52 })

    // Sparkle shimmer
    this.noise(0.5, 0.06, 0.55, 5000, 'highpass')
  }
}

export const AudioSynth = new AudioSynthImpl()
