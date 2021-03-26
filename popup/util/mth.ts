// Math
export default class Mth {
  public static clamp(num: number, min: number, max: number): number {
    if (num > max) return max
    if (num < min) return min
    return num
  }

  public static difficultyRange(
    difficulty: number,
    min: number,
    mid: number,
    max: number
  ): number {
    if (difficulty > 5) return mid + ((max - mid) * (difficulty - 5)) / 5
    if (difficulty < 5) return mid - ((mid - min) * (5 - difficulty)) / 5
    return mid
  }
}
