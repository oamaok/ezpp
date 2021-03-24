export default class TaikoDifficultyHitObjectRhythm {
  public ratio: number
  public difficulty: number

  constructor(numerator: number, denominator: number, difficulty: number) {
    this.ratio = numerator / denominator
    this.difficulty = difficulty
  }
}
