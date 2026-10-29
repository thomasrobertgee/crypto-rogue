/** Pure formatting helpers. */
export function fmtUsd(n: number, sign = false): string {
  const s = n < 0 ? '-' : sign && n > 0 ? '+' : ''
  const a = Math.abs(n)
  const units: Array<[number, string]> = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]
  for (const [v, u] of units) if (a >= v) return `${s}$${(a / v).toFixed(a / v >= 100 ? 0 : 1)}${u}`
  return `${s}$${a < 10 ? a.toFixed(2) : Math.round(a)}`
}

export const fmtNum = (n: number): string => fmtUsd(n).replace('$', '')
