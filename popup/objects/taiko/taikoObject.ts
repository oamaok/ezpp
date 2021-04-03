import { circle, hitobject, slider } from 'ojsama'
import HitObject from '../hitObject'
import { HitType } from './hitType'
import { ObjectType } from './objectType'

export default class TaikoObject extends HitObject {
  public objectType: ObjectType
  public hitType: HitType
  public type: number
  public time: number
  public data?: circle | slider
  public spinnerEndTime?: number
  public edgeSounds: Array<number>

  public constructor(
    hitObject: hitobject,
    objectType: ObjectType,
    hitType: HitType,
    hitSounds: number,
    edgeSounds: Array<number>
  ) {
    super(hitObject, hitSounds)
    this.objectType = objectType
    this.hitType = hitType
    this.type = this.hitObject.type
    this.time = this.hitObject.time
    this.data = this.hitObject.data
    this.edgeSounds = edgeSounds
  }

  public setSpinnerEndTime(spinnerEndTime?: number): TaikoObject {
    this.spinnerEndTime = spinnerEndTime
    return this
  }

  public typestr(): string {
    return this.hitObject.typestr()
  }
}
