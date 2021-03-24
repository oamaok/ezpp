import DifficultyHitObject from '../../objects/difficultyHitObject'
import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const MONO_HISTORY_MAX_LENGTH = 5

export default class Colour extends Skill {
  constructor(mods) {
    super(mods)
    this.skillMultiplier = 1.0
    this.strainDecayBase = 0.4
    this.monoHistory = new LimitedCapacityQueue(MONO_HISTORY_MAX_LENGTH) // LimitedCapacityQueue<number>
    this.previousHitType = null
    this.currentMonoLength = 0
  }

  /**
   * @param {DifficultyHitObject} current
   */
  strainValueOf(current) {
    if (
      !(
        current.lastObject.type & ObjectType.Hit &&
        current.baseObject.type & ObjectType.Hit &&
        current.deltaTime < 1000
      )
    ) {
      this.monoHistory.clear()
      const currentHit = current.baseObject
      this.currentMonoLength = currentHit != null ? 1 : 0
      this.previousHitType = currentHit.hitType
      return 0.0
    }
    let objectStrain = 0.0
    /**
     * @type {TaikoDifficultyHitObject}
     */
    const taikoCurrent = current
    if (
      this.previousHitType != null &&
      taikoCurrent.hitType !== this.previousHitType
    ) {
      objectStrain = 1.0
      if (this.monoHistory.count < 2) {
        objectStrain = 0.0
      } else if (
        (this.monoHistory.get(this.monoHistory.count - 1) +
          this.currentMonoLength) %
          2 ==
        0
      ) {
        objectStrain = 0.0
      }
      objectStrain *= this.repetitionPenalties()
      this.currentMonoLength = 1
    } else {
      this.currentMonoLength += 1
    }
    this.previousHitType = taikoCurrent.hitType
    return objectStrain
  }

  repetitionPenalties() {
    const mostRecentPatternsToCompare = 2
    let penalty = 1.0
    this.monoHistory.enqueue(this.currentMonoLength)
    for (
      let start = this.monoHistory.count - mostRecentPatternsToCompare - 1;
      start >= 0;
      start--
    ) {
      if (!this.isSamePattern(start, mostRecentPatternsToCompare)) continue
      let notesSince = 0
      for (let i = start; i < this.monoHistory.count; i++)
        notesSince += this.monoHistory.get(i)
      penalty *= this.repetitionPenalty(notesSince)
      break
    }
    return penalty
  }

  isSamePattern(start, mostRecentPatternsToCompare) {
    for (let i = 0; i < mostRecentPatternsToCompare; i++) {
      if (
        this.monoHistory.get(start + i) !==
        this.monoHistory.get(
          this.monoHistory.count - mostRecentPatternsToCompare + i
        )
      )
        return false
    }
    return true
  }

  repetitionPenalty(notesSince) {
    return Math.min(1.0, 0.032 * notesSince)
  }
}
