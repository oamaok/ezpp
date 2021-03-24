import { hitobject } from 'ojsama'

export default class TaikoObject {
  /**
   * @param {hitobject} hitObject
   * @param {number} objectType
   * @param {number} hitType
   */
  constructor(hitObject, hitType) {
    this.hitObject = hitObject
    this.hitType = hitType
    this.type = this.hitObject.type
    this.time = this.hitObject.time
    this.data = this.hitObject.data
  }
}
