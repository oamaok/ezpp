import { hitobject } from 'ojsama'

export default class TaikoObject {
  /**
   * @param {hitobject} hitObject
   * @param {number} objectType
   * @param {number} hitType
   * @param {number} hitSounds
   */
  constructor(hitObject, hitType, hitSounds) {
    this.hitObject = hitObject
    this.hitType = hitType
    this.hitSounds = hitSounds
    this.type = this.hitObject.type
    this.time = this.hitObject.time
    this.data = this.hitObject.data
  }
}
