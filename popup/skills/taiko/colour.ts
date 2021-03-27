import { HitType } from '../../objects/taiko/hitType'
import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const MONO_HISTORY_MAX_LENGTH = 5

export default class Colour extends Skill<TaikoDifficultyHitObject> {
  private readonly monoHistory = new LimitedCapacityQueue<number>(
    MONO_HISTORY_MAX_LENGTH
  )
  private previousHitType?: HitType
  private currentMonoLength = 0
  public skillMultiplier = 1.0
  public strainDecayBase = 0.4

  public constructor(mods: number) {
    super(mods)
  }

  public strainValueOf(current: TaikoDifficultyHitObject): number {
    // changing from/to a drum roll or a swell does not constitute a colour change.
    // hits spaced more than a second apart are also exempt from colour strain.
    if (
      !(
        current.lastObject.objectType === ObjectType.Hit &&
        current.baseObject.objectType === ObjectType.Hit &&
        current.deltaTime < 1000
      )
    ) {
      this.monoHistory.clear()

      const currentHit = current.baseObject
      if (currentHit.objectType === ObjectType.Hit) {
        this.currentMonoLength = 1
        this.previousHitType = currentHit.hitType
      } else {
        this.currentMonoLength = 0
        this.previousHitType = undefined
      }

      return 0.0
    }

    let objectStrain = 0.0

    if (
      this.previousHitType !== undefined &&
      current.hitType !== this.previousHitType
    ) {
      // The colour has changed.
      objectStrain = 1.0

      if (this.monoHistory.count < 2) {
        // There needs to be at least two streaks to determine a strain.
        objectStrain = 0.0
      } else if (
        (this.monoHistory.get(this.monoHistory.count - 1) +
          this.currentMonoLength) %
          2 ==
        0
      ) {
        // The last streak in the history is guaranteed to be a different type to the current streak.
        // If the total number of notes in the two streaks is even, nullify this object's strain.
        objectStrain = 0.0
      }

      objectStrain *= this.repetitionPenalties()
      this.currentMonoLength = 1
    } else {
      this.currentMonoLength += 1
    }

    this.previousHitType = current.hitType
    return objectStrain
  }

  private repetitionPenalties(): number {
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
      for (let i = start; i < this.monoHistory.count; i++) {
        notesSince += this.monoHistory.get(i)
      }
      penalty *= this.repetitionPenalty(notesSince)
      break
    }

    return penalty
  }

  private isSamePattern(
    start: number,
    mostRecentPatternsToCompare: number
  ): boolean {
    for (let i = 0; i < mostRecentPatternsToCompare; i++) {
      if (
        (this.monoHistory.get(start + i) | 0) !==
        (this.monoHistory.get(
          this.monoHistory.count - mostRecentPatternsToCompare + i
        ) |
          0)
      )
        return false
    }

    return true
  }

  private repetitionPenalty(notesSince: number): number {
    return Math.min(1.0, 0.032 * notesSince)
  }
}
