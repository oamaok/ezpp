import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const STRAIN_DECAY = 0.96

export const RHYTHM_HISTORY_MAX_LENGTH = 8

export default class Rhythm extends Skill<TaikoDifficultyHitObject> {
  public rhythmHistory = new LimitedCapacityQueue<TaikoDifficultyHitObject>(
    RHYTHM_HISTORY_MAX_LENGTH
  )
  public notesSinceRhythmChange = 0

  public constructor(mods: number) {
    super(mods)
    this.skillMultiplier = 10
    this.strainDecayBase = 0
  }

  public strainValueOf(current: TaikoDifficultyHitObject): number {
    if (!(current.baseObject.objectType === ObjectType.Hit)) {
      this.resetRhythmAndStrain()
      return 0.0
    }
    this.currentStrain *= STRAIN_DECAY

    this.notesSinceRhythmChange += 1

    // rhythm difficulty zero (due to rhythm not changing) => no rhythm strain.
    if (current.rhythm.difficulty === 0.0) {
      return 0
    }

    let objectStrain = current.rhythm.difficulty

    objectStrain *= this.repetitionPenalties(current)
    objectStrain *= this.patternLengthPenalty(this.notesSinceRhythmChange)
    objectStrain *= this.speedPenalty(current.deltaTime)

    // careful - needs to be done here since calls above read this value
    this.notesSinceRhythmChange = 0

    this.currentStrain += objectStrain
    return this.currentStrain
  }

  private repetitionPenalties(hitObject: TaikoDifficultyHitObject): number {
    let penalty = 1.0

    this.rhythmHistory.enqueue(hitObject)

    for (
      let mostRecentPatternsToCompare = 2;
      mostRecentPatternsToCompare <= RHYTHM_HISTORY_MAX_LENGTH / 2;
      mostRecentPatternsToCompare++
    ) {
      for (
        let start = this.rhythmHistory.count - mostRecentPatternsToCompare - 1;
        start >= 0;
        start--
      ) {
        if (!this.isSamePattern(start, mostRecentPatternsToCompare)) continue

        const notesSince =
          hitObject.objectIndex - this.rhythmHistory.get(start).objectIndex
        penalty *= this.repetitionPenalty(notesSince)
        break
      }
    }
    return penalty
  }

  private isSamePattern(
    start: number,
    mostRecentPatternsToCompare: number
  ): boolean {
    for (let i = 0; i < mostRecentPatternsToCompare; i++) {
      if (
        this.rhythmHistory.get(start + i).rhythm !==
        this.rhythmHistory.get(
          this.rhythmHistory.count - mostRecentPatternsToCompare + i
        ).rhythm
      )
        return false
    }
    return true
  }

  private repetitionPenalty(notesSince: number): number {
    return Math.min(1.0, 0.032 * notesSince)
  }

  private patternLengthPenalty(patternLength: number): number {
    const shortPatternPenalty = Math.min(0.15 * patternLength, 1.0)
    const longPatternPenalty = this.clamp(2.5 - 0.15 * patternLength, 0.0, 1.0)
    return Math.min(shortPatternPenalty, longPatternPenalty)
  }

  private speedPenalty(deltaTime: number): number {
    if (deltaTime < 80) return 1
    if (deltaTime < 210) return Math.max(0, 1.4 - 0.005 * deltaTime)

    this.resetRhythmAndStrain()
    return 0.0
  }

  private resetRhythmAndStrain(): void {
    this.currentStrain = 0.0
    this.notesSinceRhythmChange = 0
  }
}
