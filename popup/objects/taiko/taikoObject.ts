import { circle, hitobject, slider } from 'ojsama'
import { HitType } from './hitType'
import { ObjectType } from './objectType'

export default class TaikoObject {
  public hitObject: hitobject
  public objectType: ObjectType
  public hitType: HitType
  public hitSounds: number
  public type: number
  public time: number
  public data: circle | slider

  public constructor(
    hitObject: hitobject,
    objectType: ObjectType,
    hitType: HitType,
    hitSounds: number
  ) {
    this.hitObject = hitObject
    this.objectType = objectType
    this.hitType = hitType
    this.hitSounds = hitSounds
    this.type = this.hitObject.type
    this.time = this.hitObject.time
    this.data = this.hitObject.data
  }

  public typestr(): string {
    return this.hitObject.typestr()
  }
}
