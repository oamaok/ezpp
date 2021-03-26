import DifficultyHitObject from '../objects/difficultyHitObject'
import Arrays from '../util/arrays'
import LimitedCapacityStack from '../util/limitedCapacityStack'

export default abstract class Skill<T extends DifficultyHitObject> {
  public strainPeaks: Array<number> = []
  public skillMultiplier = 1.0
  public strainDecayBase = 1.0
  public decayWeight = 0.9
  public currentStrain = 1
  public mods: number
  public currentSectionPeak = 1
  protected readonly previous = new LimitedCapacityStack<T>(2)

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
    this.previous.push(current)
  }

  public saveCurrentPeak(): void {
    if (this.previous.count > 0) {
      this.strainPeaks.push(this.currentSectionPeak)
    }
  }

  /**
   * Sets the initial strain level for a new section.
   * @param time The beginning of the new section in milliseconds.
   */
  public startNewSectionFrom(time: number): void {
    if (this.previous.count > 0) {
      this.currentSectionPeak = this.getPeakStrain(time)
    }
  }

  /**
   * Retrieves the peak strain at a point in time.
   * @param time The time to retrieve the peak strain at.
   */
  protected getPeakStrain(time: number): number {
    return (
      this.currentStrain *
      this.strainDecay(time - this.previous.get(0).baseObject.time)
    )
  }

  public strainDecay(ms: number): number {
    return Math.pow(this.strainDecayBase, ms / 1000)
  }

  public abstract strainValueOf(current: T): number

  public getDifficultyValue(): number {
    let difficulty = 0
    let weight = 1
    Arrays.copyArray(this.strainPeaks)
      .sort((a, b) => b - a)
      .forEach((strain) => {
        difficulty += strain * weight
        weight *= this.decayWeight
      })
    return difficulty
  }
}
