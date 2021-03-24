import DifficultyHitObject from '../difficultyHitObject'
import { hitobject } from 'ojsama'
import TaikoDifficultyHitObjectRhythm from './taikoDifficultyHitObjectRhythm'
import TaikoObject from './taikoObject'

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
  /**
   * @param {TaikoObject} hitObject
   * @param {TaikoObject} lastObject
   * @param {TaikoObject} lastLastObject
   * @param {number} clockRate 1 = 100%, 1.5 = 150% (DT), 0.75 = 75% (HT)
   * @param {number} objectIndex
   */
  constructor(hitObject, lastObject, lastLastObject, clockRate, objectIndex) {
    super(hitObject, lastObject, clockRate)
    this.rhythm = this.getClosestRhythm(lastObject, lastLastObject, clockRate)
    /**
     * 0 = centre, 1 = rim
     */
    this.hitType = hitObject.hitType
    this.objectIndex = objectIndex
    this.staminaCheese = false
  }

  /**
   * @param {TaikoObject} lastObject
   * @param {TaikoObject} lastLastObject
   * @param {number} clockRate
   */
  getClosestRhythm(lastObject, lastLastObject, clockRate) {
    const prevLength = (lastObject.time - lastLastObject.time) / clockRate
    const ratio = this.deltaTime / prevLength
    let currentRhythm = null
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
