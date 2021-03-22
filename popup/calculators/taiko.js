import ojsama from 'ojsama';

export const GREAT_MIN = 34;
export const GREAT_MID = 49;
export const GREAT_MAX = 64;

export function difficltyRange(od, min, mid, max) {
  if (od > 5) return mid + (max - mid) * (od - 5) / 5;
  if (od < 5) return mid - (mid - min) * (5 - od) / 5;
  return mid;
}

// it should work on most maps, but there are some issues that needs to be resolved:
// - https://osu.ppy.sh/beatmapsets/554873#taiko/1174566 (giving too much huge pp)
// - https://osu.ppy.sh/beatmapsets/1057894#taiko/2216559 (giving a bit more pp)
// - https://osu.ppy.sh/beatmapsets/1236758#taiko/2570727 (giving less pp, but only few)
// - https://osu.ppy.sh/beatmapsets/328117#taiko/727903 (giving a bit more pp)
// - https://osu.ppy.sh/beatmapsets/1225464#taiko/2548643 (giving less pp)
// - https://osu.ppy.sh/beatmapsets/967870#taiko/2025380 (giving more pp)
/**
 * @param {ojsama.beatmap} map
 * @param {{ total: number }} stars
 * @param {ojsama.modbits} mods
 */
export function calculateTaikoPerformance(map, stars, mods, combo, misses, accuracy) {
  let multiplier = 1.3;
  if (mods & ojsama.modbits.nf) multiplier *= 0.90;
  if (mods & ojsama.modbits.hd) multiplier *= 1.10;
  const strainValue = calculateTaikoStrainPerformance(stars, mods, misses, accuracy / 100, combo);
  const accuracyValue = calculateTaikoAccuracyPerformance((Math.floor(difficltyRange(map.od, GREAT_MIN, GREAT_MID, GREAT_MAX)) / map.tick_rate), accuracy / 100, combo);
  const total = Math.pow(
    Math.pow(strainValue, 1.1) + Math.pow(accuracyValue, 1.1),
    1.0 / 1.1
  ) * multiplier;
  return { total };
}

export function calculateTaikoStrainPerformance(stars, mods, misses, accuracy, combo) {
  let strainValue = Math.pow(5.0 * Math.max(1.0, stars / 0.0075) - 4.0, 2.0) / 100000.0;
  const lengthBonus = 1 + 0.16 * Math.min(1.0, combo / 1500.0);
  strainValue *= lengthBonus;
  strainValue *= Math.pow(0.985, misses);
  if (mods & ojsama.modbits.hd) strainValue *= 1.025;
  if (mods & ojsama.modbits.fl) strainValue *= 1.05 * lengthBonus;
  return strainValue * accuracy;
}

export function calculateTaikoAccuracyPerformance(greatHitWindow, accuracy, combo) {
  const accValue = Math.pow(150.0 / greatHitWindow, 1.1) * Math.pow(accuracy, 15) * 22.0;
  return accValue * Math.min(1.15, Math.pow(combo / 1500.0, 0.3));
}
