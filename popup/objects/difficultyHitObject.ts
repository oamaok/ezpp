import { hitobject } from 'ojsama'

export default class DifficultyHitObject {
  public time: number
  public baseObject: hitobject
  public lastObject: hitobject
  public deltaTime: number

  /**
   * @param clockRate The rate at which the gameplay clock is run at.
   */
  constructor(baseObject: hitobject, lastObject: hitobject, clockRate: number) {
    if (!baseObject) throw new Error('baseObject cannot be null')
    if (!lastObject) throw new Error('lastObject cannot be null')
    this.time = baseObject.time
    this.baseObject = baseObject
    this.lastObject = lastObject
    this.deltaTime = (baseObject.time - lastObject.time) / clockRate
  }
}
