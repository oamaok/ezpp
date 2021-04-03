export namespace Precision {
  export const almostEquals = (
    value1: number,
    value2: number,
    acceptableDiff: number = Number.EPSILON
  ) => {
    return Math.abs(value1 - value2) <= acceptableDiff
  }

  export const almostBigger = (
    value1: number,
    value2: number,
    acceptableDiff: number = Number.EPSILON
  ) => {
    return value1 > value2 - acceptableDiff
  }

  export const definitelyBigger = (
    value1: number,
    value2: number,
    acceptableDiff: number = Number.EPSILON
  ) => {
    return value1 - acceptableDiff > value2
  }
}
