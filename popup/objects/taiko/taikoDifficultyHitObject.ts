import DifficultyHitObject from '../difficultyHitObject'
import TaikoDifficultyHitObjectRhythm from './taikoDifficultyHitObjectRhythm'
import TaikoObject from './taikoObject'
import { HitType } from './hitType'

export const COMMON_RHYTHMS = [
  new TaikoDifficultyHitObjectRhythm(1, 1, 0.0),
  new TaikoDifficultyHitObjectRhythm(2, 1, 0.3),
  new TaikoDifficultyHitObjectRhythm(1, 2, 0.5),
  new TaikoDifficultyHitObjectRhythm(3, 1, 0.3),
  new TaikoDifficultyHitObjectRhythm(1, 3, 0.35),
  new TaikoDifficultyHitObjectRhythm(3, 2, 0.6), // purposefully higher (requires hand switch in full alternating gameplay style)
  new TaikoDifficultyHitObjectRhythm(2, 3, 0.4),
  new TaikoDifficultyHitObjectRhythm(5, 4, 0.5),
  new TaikoDifficultyHitObjectRhythm(4, 5, 0.7),
]

export default class TaikoDifficultyHitObject extends DifficultyHitObject {
  // overrides properties on super class
  public baseObject: TaikoObject
  public lastObject: TaikoObject
  public lastLastObject: TaikoObject

  public rhythm: TaikoDifficultyHitObjectRhythm
  public hitType: HitType
  public objectIndex: number
  public staminaCheese = false

  /**
   * @param clockRate 1 = 100%, 1.5 = 150% (DT), 0.75 = 75% (HT)
   */
  constructor(
    baseObject: TaikoObject,
    lastObject: TaikoObject,
    lastLastObject: TaikoObject,
    clockRate: number,
    objectIndex: number
  ) {
    super(baseObject, lastObject, clockRate)
    this.baseObject = baseObject
    this.lastObject = lastObject
    this.lastLastObject = lastLastObject
    this.rhythm = this.getClosestRhythm(lastObject, lastLastObject, clockRate)
    this.objectIndex = objectIndex
    this.hitType = baseObject.hitType
    this.staminaCheese = false
  }

  public getClosestRhythm(
    lastObject: TaikoObject,
    lastLastObject: TaikoObject,
    clockRate: number
  ) {
    const prevLength = (lastObject.time - lastLastObject.time) / clockRate
    const ratio = this.deltaTime / prevLength
    let currentRhythm: TaikoDifficultyHitObjectRhythm = COMMON_RHYTHMS[0] // fallback
    let currentRatio = Number.MAX_VALUE
    COMMON_RHYTHMS.forEach((r) => {
      if (Math.abs(r.ratio - ratio) < currentRatio) {
        currentRatio = Math.abs(r.ratio - ratio)
        currentRhythm = r
      }
    })
    return currentRhythm
  }
}
