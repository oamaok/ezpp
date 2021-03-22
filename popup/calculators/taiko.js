import ojsama from 'ojsama';

export const GREAT_MIN = 50;
export const GREAT_MID = 35;
export const GREAT_MAX = 20;

export function difficltyRange(difficulty, min, mid, max) {
  if (difficulty > 5) return mid + (max - mid) * (difficulty - 5) / 5;
  if (difficulty < 5) return mid - (mid - min) * (5 - difficulty) / 5;
  return mid;
}

// javascript implementation of osu!lazer's pp calculator implementation: https://github.com/ppy/osu/blob/master/osu.Game.Rulesets.Taiko/Difficulty/TaikoPerformanceCalculator.cs
/**
 * @param {ojsama.beatmap} map
 * @param {{ total: number }} stars
 * @param {ojsama.modbits} mods
 */
export function calculateTaikoPerformance(map, stars, mods, combo, misses, accuracy) {
  let multiplier = 1.1;
  if (mods & ojsama.modbits.nf) multiplier *= 0.90;
  if (mods & ojsama.modbits.hd) multiplier *= 1.10;
  const strainValue = calculateTaikoStrainPerformance(stars, mods, misses, accuracy / 100, combo);
  const accuracyValue = calculateTaikoAccuracyPerformance((difficltyRange(map.od, GREAT_MIN, GREAT_MID, GREAT_MAX) | 0), accuracy / 100, combo); // todo: clockRate, see DifficultyCalculator.cs:47, TaikoDifficultyCalculator.cs:65
  const total = Math.pow(
    Math.pow(strainValue, 1.1) + Math.pow(accuracyValue, 1.1),
    1.0 / 1.1
  ) * multiplier;
  return { total, strain: strainValue, accuracy: accuracyValue };
}

export function calculateTaikoStrainPerformance(stars, mods, misses, accuracy, combo) {
  let strainValue = Math.pow(5.0 * Math.max(1.0, stars / 0.0075) - 4.0, 2.0) / 100000.0;
  const lengthBonus = 1 + 0.1 * Math.min(1.0, combo / 1500.0);
  strainValue *= lengthBonus;
  strainValue *= Math.pow(0.985, misses);
  if (mods & ojsama.modbits.hd) strainValue *= 1.025;
  if (mods & ojsama.modbits.fl) strainValue *= 1.05 * lengthBonus;
  return strainValue * accuracy;
}

export function calculateTaikoAccuracyPerformance(greatHitWindow, accuracy, combo) {
  if (greatHitWindow <= 0) return 0;
  const accValue = Math.pow(150.0 / greatHitWindow, 1.1) * Math.pow(accuracy, 15) * 22.0;
  return accValue * Math.min(1.15, Math.pow(combo / 1500.0, 0.3));
}
