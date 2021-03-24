import ojsama from 'ojsama'
import DifficultyHitObject from '../objects/difficultyHitObject.js'

export default abstract class Skill<T extends DifficultyHitObject> {
  public strainPeaks: Array<number> = []
  public skillMultiplier = 1.0
  public strainDecayBase = 1.0
  public decayWeight = 0.9
  public currentStrain = 1
  public mods: number
  public currentSectionPeak = 1
  public previous?: T

  public constructor(mods: number) {
    this.strainPeaks = []
    this.skillMultiplier = 1.0
    this.strainDecayBase = 1.0
    this.decayWeight = 0.9
    this.currentStrain = 1
    this.mods = mods
    this.currentSectionPeak = 1
  }

  public process(current: T): void {
    this.currentStrain *= this.strainDecay(current.deltaTime)
    this.currentStrain += this.strainValueOf(current) * this.skillMultiplier
    this.currentSectionPeak = Math.max(
      this.currentStrain,
      this.currentSectionPeak
    )
    this.previous = current
  }

  public saveCurrentPeak(): void {
    if (this.previous) {
      this.strainPeaks.push(this.currentSectionPeak)
    }
  }

  /**
   * Sets the initial strain level for a new section.
   * @param time The beginning of the new section in milliseconds.
   */
  public startNewSectionFrom(time: number): void {
    if (this.previous) {
      this.currentSectionPeak = this.getPeakStrain(time)
    }
  }

  /**
   * Retrieves the peak strain at a point in time.
   * @param time The time to retrieve the peak strain at.
   */
  public getPeakStrain(time: number): number {
    if (!this.previous) return 0
    return (
      this.currentStrain *
      this.strainDecay(time - this.previous.baseObject.time)
    )
  }

  public strainDecay(ms: number): number {
    return Math.pow(this.strainDecayBase, ms / 1000)
  }

  public abstract strainValueOf(current: T): number

  public getDifficultyValue(): number {
    let difficulty = 0
    let weight = 1
    this.copyArray(this.strainPeaks)
      .sort((a, b) => b - a)
      .forEach((strain) => {
        difficulty += strain * weight
        weight *= this.decayWeight
      })
    return difficulty
  }

  /* utility methods */
  public clamp(num: number, min: number, max: number): number {
    if (num > max) return max
    if (num < min) return min
    return num
  }

  /**
   * Creates a shallow copy of an array and returns it.
   */
  copyArray<E>(array: E[]): E[] {
    return [...array]
  }
}
