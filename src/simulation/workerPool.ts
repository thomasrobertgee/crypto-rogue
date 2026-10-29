import { BotSimulatorEngine, type SimulationResults } from './BotSimulatorEngine'
import type { SimWorkerResponse } from './simWorker'

export interface RunSimOptions {
  botCount: number
  days: number
  seed?: number
  options?: any
  onProgress?: (progressPct: number, currentDay: number, currentBot: number, message?: string) => void
}

export class WorkerPool {
  private static activeWorker: Worker | null = null

  /**
   * Spawns a dedicated Web Worker to run headless Monte Carlo simulations off the main thread.
   * Gracefully falls back to main-thread execution if Web Workers are unavailable or blocked.
   */
  public static async run(params: RunSimOptions): Promise<SimulationResults> {
    const { botCount, days, seed, options, onProgress } = params

    // Check for Web Worker capability in browser environment
    if (typeof Worker !== 'undefined') {
      try {
        if (this.activeWorker) {
          this.activeWorker.terminate()
          this.activeWorker = null
        }

        const worker = new Worker(new URL('./simWorker.ts', import.meta.url), {
          type: 'module',
        })
        this.activeWorker = worker

        return await new Promise<SimulationResults>((resolve, reject) => {
          worker.onmessage = (e: MessageEvent<SimWorkerResponse>) => {
            const data = e.data
            if (data.type === 'PROGRESS') {
              onProgress?.(data.progressPct, data.currentDay, data.currentBot, data.message)
            } else if (data.type === 'COMPLETE') {
              worker.terminate()
              if (this.activeWorker === worker) this.activeWorker = null
              resolve(data.results)
            } else if (data.type === 'ERROR') {
              worker.terminate()
              if (this.activeWorker === worker) this.activeWorker = null
              reject(new Error(data.error))
            }
          }

          worker.onerror = (err) => {
            console.warn('Web Worker error, falling back to main-thread runner:', err)
            worker.terminate()
            if (this.activeWorker === worker) this.activeWorker = null
            // Fallback inline
            this.runInline(params).then(resolve).catch(reject)
          }

          worker.postMessage({
            type: 'START_SIM',
            botCount,
            days,
            seed,
            options,
          })
        })
      } catch (e) {
        console.warn('Worker instantiation failed, using inline simulation:', e)
      }
    }

    // Fallback: Inline execution with UI thread yielding
    return this.runInline(params)
  }

  public static terminate() {
    if (this.activeWorker) {
      this.activeWorker.terminate()
      this.activeWorker = null
    }
  }

  private static async runInline(params: RunSimOptions): Promise<SimulationResults> {
    const { botCount, days, seed, options, onProgress } = params
    const engine = new BotSimulatorEngine(botCount, days, seed, options)
    return engine.runSimulation(onProgress)
  }
}
