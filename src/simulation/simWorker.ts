import { BotSimulatorEngine } from './BotSimulatorEngine'

export interface SimWorkerMessage {
  type: 'START_SIM'
  botCount: number
  days: number
  seed?: number
  options?: any
}

export type SimWorkerResponse =
  | { type: 'PROGRESS'; progressPct: number; currentDay: number; currentBot: number; message?: string }
  | { type: 'COMPLETE'; results: any }
  | { type: 'ERROR'; error: string }

self.onmessage = async (e: MessageEvent<SimWorkerMessage>) => {
  const { type, botCount, days, seed, options } = e.data
  if (type === 'START_SIM') {
    try {
      const engine = new BotSimulatorEngine(botCount, days, seed, options)
      const results = await engine.runSimulation((progressPct, currentDay, currentBot, message) => {
        self.postMessage({
          type: 'PROGRESS',
          progressPct,
          currentDay,
          currentBot,
          message,
        })
      })

      self.postMessage({
        type: 'COMPLETE',
        results,
      })
    } catch (err: any) {
      self.postMessage({
        type: 'ERROR',
        error: err?.message || String(err),
      })
    }
  }
}
