import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const HISTORY_MAX_LENGTH = 2

export default class Stamina extends Skill<TaikoDifficultyHitObject> {
  private readonly notePairDurationHistory = new LimitedCapacityQueue<number>(
    HISTORY_MAX_LENGTH
  )
  private offhandObjectDuration = 1.7976931348623157e308
  private readonly hand: number
  public skillMultiplier = 1.0
  public strainDecayBase = 0.4

  public constructor(mods: number, rightHand: boolean) {
    super(mods)
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

      const shortestRecentNote = this.notePairDurationHistory.min()
      objectStrain += this.speedBonus(shortestRecentNote)

      if (current.staminaCheese) {
        objectStrain *= this.cheesePenalty(
          current.deltaTime + this.offhandObjectDuration
        )
      }
      return objectStrain
    }

    this.offhandObjectDuration = current.deltaTime
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
