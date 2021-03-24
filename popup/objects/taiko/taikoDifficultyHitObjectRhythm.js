export default class TaikoDifficultyHitObjectRhythm {
  /**
   * @param {number} numerator
   * @param {number} denominator
   * @param {number} difficulty
   */
  constructor(numerator, denominator, difficulty) {
    this.ratio = numerator / denominator
    this.difficulty = difficulty
  }
}
