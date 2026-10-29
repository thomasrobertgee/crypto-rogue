/**
 * Adaptive Web Audio API Synthesizer & Tactical Mobile Haptics Engine
 *
 * Lightweight, zero-asset procedural audio and tactile haptic feedback:
 * - playCoinTick(): Soft, crisp high-pitch synth blip on Green rolls.
 * - playRedCounter(): Punchy, low-frequency crunch on enemy Red strikes.
 * - playCounterPump(): Ascending energetic synthesizer riser when a ⚡ COUNTER-PUMP INTERRUPT! occurs.
 * - playVictoryJingle(): Triumphant 8-bit retro chord progression on node/stage clear.
 * - playDefeatSound(): Descending minor arpeggio when Margin Call occurs.
 *
 * Tactical Mobile Haptics (navigator.vibrate):
 * - Green Candle tick: Ultra-short 15ms light tap.
 * - Red Candle Counter-Strike: Double pulse [30ms, 40ms, 30ms].
 * - Counter-Pump Interrupt: Strong 120ms heavy rumble.
 * - Boss Black Swan Ultimate: Escalating pattern [50ms, 30ms, 80ms, 40ms, 150ms].
 */

import { AudioSynth } from '../engine/AudioSynth'
import { useMetaStore } from '../state/useMetaStore'

class AudioHapticsEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null

  private ensureAudio(): AudioContext | null {
    if (this.ctx) return this.ctx
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null

    this.ctx = new Ctor()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.55

    const compressor = this.ctx.createDynamicsCompressor()
    compressor.threshold.value = -20
    compressor.knee.value = 25
    compressor.ratio.value = 8
    compressor.attack.value = 0.003
    compressor.release.value = 0.2

    this.masterGain.connect(compressor).connect(this.ctx.destination)
    return this.ctx
  }

  private ready(): AudioContext | null {
    const meta = useMetaStore.getState()
    if (meta.audioEnabled === false || AudioSynth.muted) return null

    const ctx = this.ensureAudio()
    if (ctx?.state === 'suspended') {
      void ctx.resume()
    }
    return ctx
  }

  // ────────────────────────────────────────
  // PROCEDURAL AUDIO SYNTHESIZERS
  // ────────────────────────────────────────

  /** Soft, crisp high-pitch synth blip on Green coin rolls (1400Hz -> 2100Hz chime). */
  playCoinTick(): void {
    const ctx = this.ready()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1400, t)
    osc.frequency.exponentialRampToValueAtTime(2100, t + 0.05)

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065)

    osc.connect(gain).connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.07)
  }

  /** Punchy, low-frequency crunch on enemy Red strikes (120Hz saw sweep + filtered crunch). */
  playRedCounter(): void {
    const ctx = this.ready()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime

    // Low Sawtooth impact
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(120, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.16)

    oscGain.gain.setValueAtTime(0.24, t)
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

    osc.connect(oscGain).connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.19)

    // Filtered noise crunch
    const bufferSize = Math.floor(ctx.sampleRate * 0.12)
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const noiseSrc = ctx.createBufferSource()
    noiseSrc.buffer = noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 650

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.15, t)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)

    noiseSrc.connect(filter).connect(noiseGain).connect(this.masterGain)
    noiseSrc.start(t)
    noiseSrc.stop(t + 0.13)
  }

  /** Ascending energetic synthesizer riser when a ⚡ COUNTER-PUMP INTERRUPT! occurs. */
  playCounterPump(): void {
    const ctx = this.ready()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime

    // Dual-oscillator riser (320Hz -> 1450Hz and 640Hz -> 2900Hz harmonic)
    ;[
      { freqStart: 320, freqEnd: 1450, type: 'sawtooth' as const, vol: 0.16 },
      { freqStart: 640, freqEnd: 2900, type: 'square' as const, vol: 0.12 },
    ].forEach(({ freqStart, freqEnd, type, vol }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freqStart, t)
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t + 0.38)

      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(vol, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42)

      osc.connect(gain).connect(this.masterGain!)
      osc.start(t)
      osc.stop(t + 0.44)
    })

    // Triumphant top shimmer ping at peak
    const ping = ctx.createOscillator()
    const pingGain = ctx.createGain()
    ping.type = 'triangle'
    ping.frequency.setValueAtTime(1760, t + 0.28) // A6
    pingGain.gain.setValueAtTime(0.001, t + 0.28)
    pingGain.gain.linearRampToValueAtTime(0.22, t + 0.3)
    pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)

    ping.connect(pingGain).connect(this.masterGain)
    ping.start(t + 0.28)
    ping.stop(t + 0.62)
  }

  /** Triumphant 8-bit retro chord progression on node/stage clear (C5 -> E5 -> G5 -> C6). */
  playVictoryJingle(): void {
    const ctx = this.ready()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const notes = [
      { f: 523.25, delay: 0.0, dur: 0.12 }, // C5
      { f: 659.25, delay: 0.09, dur: 0.12 }, // E5
      { f: 783.99, delay: 0.18, dur: 0.14 }, // G5
      { f: 1046.5, delay: 0.28, dur: 0.45 }, // C6
      { f: 1318.5, delay: 0.38, dur: 0.55 }, // E6 harmonic
    ]

    notes.forEach(({ f, delay, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(f, t + delay)

      gain.gain.setValueAtTime(0.001, t + delay)
      gain.gain.linearRampToValueAtTime(0.14, t + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur)

      osc.connect(gain).connect(this.masterGain!)
      osc.start(t + delay)
      osc.stop(t + delay + dur + 0.02)
    })
  }

  /** Descending minor arpeggio when Margin Call liquidation occurs (Eb4 -> C4 -> Ab3 -> F3). */
  playDefeatSound(): void {
    const ctx = this.ready()
    if (!ctx || !this.masterGain) return

    const t = ctx.currentTime
    const notes = [
      { f: 311.13, delay: 0.0, dur: 0.18 }, // Eb4
      { f: 261.63, delay: 0.14, dur: 0.2 }, // C4
      { f: 207.65, delay: 0.3, dur: 0.24 }, // Ab3
      { f: 130.81, delay: 0.5, dur: 0.65 }, // C3 low sub
    ]

    notes.forEach(({ f, delay, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(f, t + delay)
      if (delay > 0.4) {
        osc.frequency.exponentialRampToValueAtTime(40, t + delay + dur)
      }

      gain.gain.setValueAtTime(0.001, t + delay)
      gain.gain.linearRampToValueAtTime(0.2, t + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + dur)

      osc.connect(gain).connect(this.masterGain!)
      osc.start(t + delay)
      osc.stop(t + delay + dur + 0.02)
    })
  }

  // ────────────────────────────────────────
  // TACTICAL MOBILE HAPTIC FEEDBACK (navigator.vibrate)
  // ────────────────────────────────────────

  private canVibrate(): boolean {
    const meta = useMetaStore.getState()
    if (meta.hapticsEnabled === false) return false
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  }

  /** Green Candle tick: Ultra-short 15ms light tap. */
  vibrateGreenTick(): void {
    if (!this.canVibrate()) return
    try {
      navigator.vibrate(15)
    } catch {}
  }

  /** Red Candle Counter-Strike: Double pulse [30ms, 40ms, 30ms]. */
  vibrateRedCounter(): void {
    if (!this.canVibrate()) return
    try {
      navigator.vibrate([30, 40, 30])
    } catch {}
  }

  /** Counter-Pump Interrupt: Strong 120ms heavy rumble. */
  vibrateCounterPump(): void {
    if (!this.canVibrate()) return
    try {
      navigator.vibrate(120)
    } catch {}
  }

  /** Boss Black Swan Ultimate: Escalating pattern [50ms, 30ms, 80ms, 40ms, 150ms]. */
  vibrateBossUltimate(): void {
    if (!this.canVibrate()) return
    try {
      navigator.vibrate([50, 30, 80, 40, 150])
    } catch {}
  }
}

export const AudioHaptics = new AudioHapticsEngine()
