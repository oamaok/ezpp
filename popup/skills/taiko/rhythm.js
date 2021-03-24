import DifficultyHitObject from '../../objects/difficultyHitObject'
import { ObjectType } from '../../objects/taiko/objectType'
import TaikoDifficultyHitObject from '../../objects/taiko/taikoDifficultyHitObject'
import LimitedCapacityQueue from '../../util/limitedCapacityQueue'
import Skill from '../skill'

export const STRAIN_DECAY = 0.96

export const RHYTHM_HISTORY_MAX_LENGTH = 8

export default class Rhythm extends Skill {
  constructor(mods) {
    super(mods)
    this.skillMultiplier = 10
    this.strainDecayBase = 0
    this.rhythmHistory = new LimitedCapacityQueue(RHYTHM_HISTORY_MAX_LENGTH) // LimitedCapacityQueue<TaikoDifficultyHitObject>
    this.notesSinceRhythmChange = 0
  }

  /**
   * @param {DifficultyHitObject} current
   */
  strainValueOf(current) {
    if (!(current.baseObject.type & ObjectType.Hit)) {
      this.resetRhythmAndStrain()
      return 0.0
    }
    this.currentStrain *= STRAIN_DECAY

    /**
     * @type {TaikoDifficultyHitObject}
     */
    const hitObject = current
    this.notesSinceRhythmChange += 1

    // rhythm difficulty zero (due to rhythm not changing) => no rhythm strain.
    if (hitObject.rhythm.difficulty === 0.0) {
      return 0
    }

    let objectStrain = hitObject.rhythm.difficulty

    objectStrain *= this.repetitionPenalties(hitObject)
    objectStrain *= this.patternLengthPenalty(this.notesSinceRhythmChange)
    objectStrain *= this.speedPenalty(hitObject.deltaTime)

    // careful - needs to be done here since calls above read this value
    this.notesSinceRhythmChange = 0

    this.currentStrain += objectStrain
    return this.currentStrain
  }

  /**
   * @param {TaikoDifficultyHitObject} hitObject
   */
  repetitionPenalties(hitObject) {
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

  isSamePattern(start, mostRecentPatternsToCompare) {
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

  repetitionPenalty(notesSince) {
    return Math.min(1.0, 0.032 * notesSince)
  }

  patternLengthPenalty(patternLength) {
    const shortPatternPenalty = Math.min(0.15 * patternLength, 1.0)
    const longPatternPenalty = this.clamp(2.5 - 0.15 * patternLength, 0.0, 1.0)
    return Math.min(shortPatternPenalty, longPatternPenalty)
  }

  speedPenalty(deltaTime) {
    if (deltaTime < 80) return 1
    if (deltaTime < 210) return Math.max(0, 1.4 - 0.005 * deltaTime)

    this.resetRhythmAndStrain()
    return 0.0
  }

  resetRhythmAndStrain() {
    this.currentStrain = 0.0
    this.notesSinceRhythmChange = 0
  }
}
