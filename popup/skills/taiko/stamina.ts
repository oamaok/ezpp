import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const HISTORY_MAX_LENGTH = 2

export default class Stamina extends Skill<TaikoDifficultyHitObject> {
  public notePairDurationHistory = new LimitedCapacityQueue<number>(
    HISTORY_MAX_LENGTH
  )
  public offhandObjectDuration = Number.MAX_VALUE
  public hand: number

  public constructor(mods: number, rightHand: boolean) {
    super(mods)
    this.skillMultiplier = 1.0
    this.strainDecayBase = 0.4
    this.hand = rightHand ? 1 : 0
  }

  public strainValueOf(current: TaikoDifficultyHitObject): number {
    if (current.baseObject.objectType !== ObjectType.Hit) {
      return 0.0
    }

    if (current.objectIndex % 2 === this.hand) {
      let objectStrain = 1

      if (current.objectIndex === 1) return 1

      this.notePairDurationHistory.enqueue(
        current.deltaTime + this.offhandObjectDuration
      )

      let shortestRecentNote = Number.MAX_VALUE
      this.notePairDurationHistory.forEach((n) => {
        if (n < shortestRecentNote) shortestRecentNote = n
      })
      objectStrain += this.speedBonus(shortestRecentNote)
      if (current.staminaCheese) {
        objectStrain *= this.cheesePenalty(
          current.deltaTime + this.offhandObjectDuration
        )
      }
      return objectStrain
    }
    return 0
  }

  private cheesePenalty(notePairDuration: number): number {
    if (notePairDuration > 125) return 1
    if (notePairDuration < 100) return 0.6
    return 0.6 + (notePairDuration - 100) * 0.016
  }

  private speedBonus(notePairDuration: number): number {
    if (notePairDuration >= 200) return 0
    let bonus = 200 - notePairDuration
    bonus *= bonus
    return bonus / 100000
  }
}
