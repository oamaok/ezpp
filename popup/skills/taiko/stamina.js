import ojsama from 'ojsama'
import DifficultyHitObject from '../../objects/difficultyHitObject'
import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const HISTORY_MAX_LENGTH = 2

export default class Stamina extends Skill {
  /**
   * @param {ojsama.modbits} mods
   * @param {boolean} rightHand
   */
  constructor(mods, rightHand) {
    super(mods)
    this.skillMultiplier = 1.0
    this.strainDecayBase = 0.4
    this.notePairDurationHistory = new LimitedCapacityQueue(HISTORY_MAX_LENGTH) // LimitedCapacityQueue<number>
    this.offhandObjectDuration = 1.7976931348623157e308 // double.MaxValue
    this.hand = rightHand ? 1 : 0
  }

  /**
   * @param {DifficultyHitObject} current
   */
  strainValueOf(current) {
    if (!(current.baseObject.type & ObjectType.Hit)) {
      return 0.0
    }

    /**
     * @type {TaikoDifficultyHitObject}
     */
    const hitObject = current

    if (hitObject.objectIndex % 2 === this.hand) {
      let objectStrain = 1

      if (hitObject.objectIndex === 1) return 1

      this.notePairDurationHistory.enqueue(
        hitObject.deltaTime + this.offhandObjectDuration
      )

      let shortestRecentNote = Number.MAX_VALUE
      this.notePairDurationHistory.forEach((n) => {
        if (n < shortestRecentNote) shortestRecentNote = n
      })
      objectStrain += this.speedBonus(shortestRecentNote)
      if (hitObject.staminaCheese) {
        objectStrain *= this.cheesePenalty(
          hitObject.deltaTime + this.offhandObjectDuration
        )
      }
      return objectStrain
    }
    return 0
  }

  cheesePenalty(notePairDuration) {
    if (notePairDuration > 125) return 1
    if (notePairDuration < 100) return 0.6
    return 0.6 + (notePairDuration - 100) * 0.016
  }

  speedBonus(notePairDuration) {
    if (notePairDuration >= 200) return 0
    let bonus = 200 - notePairDuration
    bonus *= bonus
    return bonus / 100000
  }
}
