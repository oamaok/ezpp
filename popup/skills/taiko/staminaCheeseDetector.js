import { HitType } from '../../objects/taiko/hitType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'

export default class StaminaCheeseDetector {
  /**
   * @param {TaikoDifficultyHitObject[]} objects
   */
  constructor(objects) {
    this.roll_min_repetitions = 12
    this.tl_min_repetitions = 16
    this.objects = objects
  }

  findCheese() {
    this.findRolls(3)
    this.findRolls(4)

    this.findTlTap(0, HitType.Rim)
    this.findTlTap(1, HitType.Rim)
    this.findTlTap(0, HitType.Centre)
    this.findTlTap(1, HitType.Centre)
  }

  /**
   * @param {number} patternLength
   */
  findRolls(patternLength) {
    const history = new LimitedCapacityQueue(2 * patternLength)
    let indexBeforeLastRepeat = -1
    let lastMarkEnd = 0
    for (let i = 0; i < this.objects.length; i++) {
      history.enqueue(this.objects[i])
      if (!history.isFull()) continue
      if (!this.containsPatternRepeat(history, patternLength)) {
        indexBeforeLastRepeat = i - history.count + 1
        continue
      }
      const repeatedLength = i - indexBeforeLastRepeat
      if (repeatedLength < this.roll_min_repetitions) continue
      this.markObjectsAsCheese(Math.max(lastMarkEnd, i - repeatedLength + 1), i)
      lastMarkEnd = i
    }
  }

  /**
   * @param {LimitedCapacityQueue} history
   * @param {number} patternLength
   */
  containsPatternRepeat(history, patternLength) {
    for (let j = 0; j < patternLength; j++) {
      if (history.get(j).hitType !== history.get(j + patternLength).hitType)
        return false
    }
    return true
  }

  /**
   * Finds and marks all sequences hittable using a TL tap.
   * @param {number} parity
   * @param {number} hitType
   */
  findTlTap(parity, hitType) {
    let tlLength = -2
    let lastMarkEnd = 0
    for (let i = parity; i < this.objects.length; i++) {
      if (this.objects[i].hitType === hitType) {
        tlLength += 2
      } else {
        tlLength = -2
      }
      if (tlLength < this.tl_min_repetitions) {
        continue
      }
      this.markObjectsAsCheese(Math.max(lastMarkEnd, i - tlLength + 1), i)
      lastMarkEnd = i
    }
  }

  /**
   * Marks all objects from start to end (inclusive) as cheese.
   * @param {number} start
   * @param {number} end
   */
  markObjectsAsCheese(start, end) {
    for (let i = start; i < end; i++) {
      this.objects[i].staminaCheese = true
    }
  }
}
