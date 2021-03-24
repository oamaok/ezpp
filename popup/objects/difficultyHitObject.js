import { hitobject } from 'ojsama'

export default class DifficultyHitObject {
  /**
   * @param {hitobject} baseObject
   * @param {hitobject} lastObject
   * @param {number} clockRate The rate at which the gameplay clock is run at.
   */
  constructor(baseObject, lastObject, clockRate) {
    this.baseObject = baseObject
    this.lastObject = lastObject
    this.deltaTime = (baseObject.time - lastObject.time) / clockRate
  }
}
