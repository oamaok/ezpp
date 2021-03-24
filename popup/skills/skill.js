import ojsama from 'ojsama'
import DifficultyHitObject from '../objects/difficultyHitObject'

export default class Skill {
  /**
   * @param {ojsama.modbits} mods
   */
  constructor(mods) {
    this.strainPeaks = []
    this.skillMultiplier = 1.0
    this.strainDecayBase = 1.0
    this.decayWeight = 0.9
    this.currentStrain = 1
    this.mods = mods
    this.currentSectionPeak = 1
    this.previous = null
  }

  /**
   * @param {DifficultyHitObject} current
   */
  process(current) {
    this.currentStrain *= this.strainDecay(current.deltaTime)
    this.currentStrain += this.strainValueOf(current) * this.skillMultiplier
    this.currentSectionPeak = Math.max(
      this.currentStrain,
      this.currentSectionPeak
    )
    this.previous = current
  }

  saveCurrentPeak() {
    if (this.previous) {
      this.strainPeaks.push(this.currentSectionPeak)
    }
  }

  /**
   * Sets the initial strain level for a new section.
   * @param {number} time The beginning of the new section in milliseconds.
   */
  startNewSectionFrom(time) {
    if (this.previous) {
      this.currentSectionPeak = this.getPeakStrain(time)
    }
  }

  /**
   * Retrieves the peak strain at a point in time.
   * @param {number} time The time to retrieve the peak strain at.
   */
  getPeakStrain(time) {
    return (
      this.currentStrain *
      this.strainDecay(time - this.previous.baseObject.time)
    )
  }

  strainDecay(ms) {
    return Math.pow(this.strainDecayBase, ms / 1000)
  }

  /**
   * @param {DifficultyHitObject} current
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  strainValueOf(current) {
    throw new Error('abstract')
  }

  getDifficultyValue() {
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
  clamp(num, min, max) {
    if (num > max) return max
    if (num < min) return min
    return num
  }

  /**
   * @param {any[]} array
   */
  copyArray(array) {
    const arr = []
    array.forEach((a) => {
      arr.push(a)
    })
    return arr
  }
}
