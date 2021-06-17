import ojsama, { modbits } from 'ojsama'
import Mth from '../util/mth'

export const calculateRawApproachRate = (ar: number, clockRate: number = 1) => {
  const p = Mth.difficultyRange(ar, 1800, 1200, 450) / clockRate
  return p > 1200 ? (1800 - p) / 120 : (1200 - p) / 150 + 5
}

export const calculateApproachRate = (
  modifiers: number,
  ar: number
): number => {
  let adjustedAR = ar
  let clockRate = 1
  let max = Number.MAX_SAFE_INTEGER
  if (modifiers & modbits.hr) {
    adjustedAR *= 1.4
    max = 10
  }
  if (modifiers & modbits.ez) adjustedAR *= 0.5
  if (modifiers & modbits.dt) {
    clockRate = 1.5
    max = 11
  }
  if (modifiers & modbits.ht) {
    clockRate = 0.75
    max = 9
  }
  return Math.min(calculateRawApproachRate(adjustedAR, clockRate), max)
}

export const calculatePerformance = (
  map: ojsama.beatmap,
  mods: number,
  combo: number,
  misses: number,
  accuracy: number
): {
  pp: ojsama.std_ppv2
  stars: ojsama.std_diff
} => {
  const stars = new ojsama.diff().calc({ map, mods })

  const pp = ojsama.ppv2({
    stars,
    combo,
    nmiss: misses,
    acc_percent: accuracy,
  })

  return { pp, stars }
}
