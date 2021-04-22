import ojsama, { beatmap } from 'ojsama'
import TaikoDifficultyAttributes from '../objects/taiko/taikoDifficultyAttributes'
import TaikoDifficultyHitObject from '../objects/taiko/taikoDifficultyHitObject'
import TaikoObject from '../objects/taiko/taikoObject'
import Skill from '../skills/skill'
import StaminaCheeseDetector from '../skills/taiko/staminaCheeseDetector'
import Colour from '../skills/taiko/colour'
import Rhythm from '../skills/taiko/rhythm'
import Stamina from '../skills/taiko/stamina'
import * as taikoConverter from '../converters/taiko'
import { ParsedTaikoResult } from '../objects/taiko/parsedTaikoResult'
import Mth from '../util/mth'
import { beatmaps } from '../util/beatmaps'
import { ObjectType } from '../objects/taiko/objectType'
import Console from '../util/console'

export const GREAT_MIN = 50
export const GREAT_MID = 35
export const GREAT_MAX = 20

export const COLOUR_SKILL_MULTIPLIER = 0.01
export const RHYTHM_SKILL_MULTIPLIER = 0.014
export const STAMINA_SKILL_MULTIPLIER = 0.02

// Used in hard rock
export const SLIDER_MULTIPLIER = (1.4 * 4) / 3

export const createDifficultyHitObjects = (
  map: beatmap,
  parsedTaikoResult: ParsedTaikoResult,
  clockRate: number,
  convert: boolean,
  mods: number
): {
  objects: Array<TaikoDifficultyHitObject>
  rawObjects: Array<TaikoObject>
} => {
  let rawTaikoObjects: Array<TaikoObject>
  if (convert) {
    rawTaikoObjects = parsedTaikoResult.objects
      .sort((a, b) => a.time - b.time)
      .map((obj) =>
        new TaikoObject(
          beatmaps.getHitObjectOrDefaultAt(map, obj.time, obj),
          obj.objectType,
          obj.hitType,
          obj.hitSounds,
          obj.edgeSounds
        ).setSpinnerEndTime(obj.spinnerEndTime)
      )
  } else {
    rawTaikoObjects = map.objects.map((obj, i) =>
      new TaikoObject(
        obj,
        parsedTaikoResult.objects[i].objectType,
        parsedTaikoResult.objects[i].hitType,
        parsedTaikoResult.objects[i].hitSounds,
        parsedTaikoResult.objects[i].edgeSounds
      ).setSpinnerEndTime(parsedTaikoResult.objects[i].spinnerEndTime)
    )
  }
  const rawObjects = taikoConverter.convertHitObjects(
    rawTaikoObjects,
    map,
    mods,
    !convert
  )
  const objects = rawObjects.flatMap((obj, i) =>
    i < 2
      ? []
      : new TaikoDifficultyHitObject(
          obj,
          rawObjects[i - 1],
          rawObjects[i - 2],
          clockRate,
          i
        )
  )
  // Remember: objects.length = rawObjects.length - 2
  if (objects.length + 2 !== rawObjects.length)
    throw new Error(
      `objects count and raw objects count does not match: ${objects.length}, ${rawObjects.length}`
    )
  new StaminaCheeseDetector(objects).findCheese() // this method name makes me hungry...
  return { objects, rawObjects }
}

export const calculate = (
  map: beatmap,
  mods: number,
  parsedTaikoResult: ParsedTaikoResult,
  convert: boolean
) => {
  const originalSV = map.sv
  const originalOverallDifficulty = map.od
  let clockRate = 1
  map.sv *= taikoConverter.LEGACY_VELOCITY_MULTIPLIER
  if (mods & ojsama.modbits.dt) clockRate = 1.5
  if (mods & ojsama.modbits.ht) clockRate = 0.75
  if (mods & ojsama.modbits.hr) {
    const ratio = 1.4
    map.cs = Math.min(map.cs * 1.3, 10)
    if (map.ar) map.ar = Math.min(map.ar * ratio, 10)
    map.od = Math.min(map.od * ratio, 10)
    map.hp = Math.min(map.hp * ratio, 10)
    map.sv *= SLIDER_MULTIPLIER
  }
  if (mods & ojsama.modbits.ez) {
    const ratio = 0.5
    map.od *= ratio
    map.sv *= 0.8
  }

  const skills = [
    new Colour(mods),
    new Rhythm(mods),
    new Stamina(mods, true),
    new Stamina(mods, false),
  ]
  if (map.objects.length === 0)
    return createDifficultyAttributes(map, mods, skills, clockRate, [])

  const difficultyHitObjects = createDifficultyHitObjects(
    map,
    parsedTaikoResult,
    clockRate,
    convert,
    mods
  )
  const sectionLength = 400 * clockRate
  let currentSectionEnd =
    Math.ceil(map.objects[0].time / sectionLength) * sectionLength

  difficultyHitObjects.objects.forEach((h) => {
    while (h.baseObject.time > currentSectionEnd) {
      skills.forEach((s) => {
        s.saveCurrentPeak()
        s.startNewSectionFrom(currentSectionEnd)
      })

      currentSectionEnd += sectionLength
    }

    skills.forEach((s) => s.process(h))
  })

  // The peak strain will not be saved for the last section in the above loop
  skills.forEach((s) => s.saveCurrentPeak())

  const attr = createDifficultyAttributes(
    map,
    mods,
    skills,
    clockRate,
    difficultyHitObjects.rawObjects
  )
  map.sv = originalSV
  map.od = originalOverallDifficulty
  return attr
}

export const createDifficultyAttributes = (
  map: beatmap,
  mods: number,
  skills: Array<Skill<TaikoDifficultyHitObject>>,
  clockRate: number,
  rawObjects: Array<TaikoObject>
): TaikoDifficultyAttributes => {
  if (map.objects.length === 0) {
    return new TaikoDifficultyAttributes(0, mods, 0, 0, 0, 0, 0, skills)
  }
  const colour = skills[0] as Colour
  const rhythm = skills[1] as Rhythm
  const staminaRight = skills[2] as Stamina
  const staminaLeft = skills[3] as Stamina

  const colourRating = colour.getDifficultyValue() * COLOUR_SKILL_MULTIPLIER
  const rhythmRating = rhythm.getDifficultyValue() * RHYTHM_SKILL_MULTIPLIER
  let staminaRating =
    (staminaRight.getDifficultyValue() + staminaLeft.getDifficultyValue()) *
    STAMINA_SKILL_MULTIPLIER

  const staminaPenalty = simpleColourPenalty(staminaRating, colourRating)
  staminaRating *= staminaPenalty

  const combinedRating = locallyCombinedDifficulty(
    colour,
    rhythm,
    staminaRight,
    staminaLeft,
    staminaPenalty
  )
  const separatedRating = norm(1.5, colourRating, rhythmRating, staminaRating)
  let starRating = 1.4 * separatedRating + 0.5 * combinedRating
  starRating = rescale(starRating)

  const greatHitWindow =
    Mth.difficultyRange(map.od, GREAT_MIN, GREAT_MID, GREAT_MAX) | 0

  return new TaikoDifficultyAttributes(
    starRating,
    mods,
    staminaRating,
    rhythmRating,
    colourRating,
    greatHitWindow / clockRate,
    rawObjects.filter((obj) => obj.objectType === ObjectType.Hit).length, // max combo
    skills
  )
}

export const simpleColourPenalty = (
  staminaDifficulty: number,
  colorDifficulty: number
): number => {
  if (colorDifficulty <= 0) return 0.79 - 0.25
  return (
    0.79 - Math.atan(staminaDifficulty / colorDifficulty - 12) / Math.PI / 2
  )
}

export const norm = (p: number, ...values: Array<number>) => {
  let e = 0
  values.forEach((n) => {
    e += Math.pow(n, p)
  })
  return Math.pow(e, 1 / p)
}

export const locallyCombinedDifficulty = (
  colour: Colour,
  rhythm: Rhythm,
  staminaRight: Stamina,
  staminaLeft: Stamina,
  staminaPenalty: number
) => {
  const peaks = colour.strainPeaks.map((colour, i) => {
    const colourPeak = colour * COLOUR_SKILL_MULTIPLIER
    const rhythmPeak = rhythm.strainPeaks[i] * RHYTHM_SKILL_MULTIPLIER
    const staminaPeak =
      (staminaRight.strainPeaks[i] + staminaLeft.strainPeaks[i]) *
      STAMINA_SKILL_MULTIPLIER *
      staminaPenalty
    return norm(2, colourPeak, rhythmPeak, staminaPeak)
  })
  let difficulty = 0
  let weight = 1
  peaks
    .sort((a, b) => b - a)
    .forEach((strain) => {
      difficulty += strain * weight
      weight *= 0.9
    })
  return difficulty
}

export const rescale = (sr: number): number =>
  sr < 0 ? sr : 10.43 * Math.log(sr / 8 + 1)

// javascript implementation of osu!lazer's pp calculator implementation: https://github.com/ppy/osu/blob/master/osu.Game.Rulesets.Taiko/Difficulty/TaikoPerformanceCalculator.cs
export const calculatePerformance = (
  map: beatmap,
  attr: TaikoDifficultyAttributes,
  mods: number,
  combo: number,
  misses: number,
  accuracy: number
): {
  total: number
  strain: number
  accuracy: number
} => {
  let multiplier = 1.1
  if (mods & ojsama.modbits.nf) multiplier *= 0.9
  if (mods & ojsama.modbits.hd) multiplier *= 1.1
  const strainValue = calculateStrainPerformance(
    attr.starRating,
    mods,
    misses,
    accuracy / 100,
    combo
  )
  const greatHitWindow =
    attr.greatHitWindow !== -1
      ? attr.greatHitWindow
      : Mth.difficultyRange(map.od, GREAT_MIN, GREAT_MID, GREAT_MAX) | 0
  const accuracyValue = calculateAccuracyPerformance(
    greatHitWindow,
    accuracy / 100,
    combo
  )
  const total =
    Math.pow(
      Math.pow(strainValue, 1.1) + Math.pow(accuracyValue, 1.1),
      1.0 / 1.1
    ) * multiplier
  return { total, strain: strainValue, accuracy: accuracyValue }
}

export const calculateStrainPerformance = (
  stars: number,
  mods: number,
  misses: number,
  accuracy: number,
  combo: number
): number => {
  let strainValue =
    Math.pow(5.0 * Math.max(1.0, stars / 0.0075) - 4.0, 2.0) / 100000.0
  const lengthBonus = 1 + 0.1 * Math.min(1.0, combo / 1500.0)
  strainValue *= lengthBonus
  strainValue *= Math.pow(0.985, misses)
  if (mods & ojsama.modbits.hd) strainValue *= 1.025
  if (mods & ojsama.modbits.fl) strainValue *= 1.05 * lengthBonus
  return strainValue * accuracy
}

export const calculateAccuracyPerformance = (
  greatHitWindow: number,
  accuracy: number,
  combo: number
): number => {
  if (greatHitWindow <= 0) return 0
  const accValue =
    Math.pow(150.0 / greatHitWindow, 1.1) * Math.pow(accuracy, 15) * 22.0
  return accValue * Math.min(1.15, Math.pow(combo / 1500.0, 0.3))
}
