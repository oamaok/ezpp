import { HitType } from '../../objects/taiko/hitType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'

export const ROLL_MIN_REPETITIONS = 12
export const TL_MIN_REPETITIONS = 16

export default class StaminaCheeseDetector {
  public objects: Array<TaikoDifficultyHitObject>

  public constructor(objects: Array<TaikoDifficultyHitObject>) {
    this.objects = objects
  }

  public findCheese(): void {
    this.findRolls(3)
    this.findRolls(4)

    this.findTlTap(0, HitType.Rim)
    this.findTlTap(1, HitType.Rim)
    this.findTlTap(0, HitType.Centre)
    this.findTlTap(1, HitType.Centre)
  }

  private findRolls(patternLength: number): void {
    const history = new LimitedCapacityQueue<TaikoDifficultyHitObject>(
      2 * patternLength
    )
    let indexBeforeLastRepeat = -1
    let lastMarkEnd = 0
    this.objects.forEach((obj, i) => {
      history.enqueue(obj)
      if (!history.isFull()) return
      if (!this.containsPatternRepeat(history, patternLength)) {
        indexBeforeLastRepeat = i - history.count + 1
        return
      }
      const repeatedLength = i - indexBeforeLastRepeat
      if (repeatedLength < ROLL_MIN_REPETITIONS) return
      this.markObjectsAsCheese(Math.max(lastMarkEnd, i - repeatedLength + 1), i)
      lastMarkEnd = i
    })
  }

  private containsPatternRepeat(
    history: LimitedCapacityQueue<TaikoDifficultyHitObject>,
    patternLength: number
  ): boolean {
    for (let j = 0; j < patternLength; j++) {
      if (history.get(j).hitType !== history.get(j + patternLength).hitType)
        return false
    }
    return true
  }

  /**
   * Finds and marks all sequences hittable using a TL tap.
   */
  private findTlTap(parity: number, hitType: number): void {
    let tlLength = -2
    let lastMarkEnd = 0
    this.objects.forEach((obj, i) => {
      if (i < parity) return
      if (obj.hitType === hitType) {
        tlLength += 2
      } else {
        tlLength = -2
      }
      if (tlLength < TL_MIN_REPETITIONS) return
      this.markObjectsAsCheese(Math.max(lastMarkEnd, i - tlLength + 1), i)
      lastMarkEnd = i
    })
  }

  /**
   * Marks all objects from start to end (inclusive) as cheese.
   */
  private markObjectsAsCheese(start: number, end: number): void {
    for (let i = start; i < end; i++) {
      this.objects[i].staminaCheese = true
    }
  }
}
