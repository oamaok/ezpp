import { circle, hitobject, slider } from 'ojsama'
import HitObject from '../hitObject'
import { ObjectType } from './objectType'

export default class CatchObject extends HitObject {
  public objectType: ObjectType
  public x: number
  public type: number
  public time: number
  public data?: circle | slider

  public constructor(
    hitObject: hitobject,
    objectType: ObjectType,
    hitSounds: number,
    x: number
  ) {
    super(hitObject, hitSounds)
    this.objectType = objectType
    this.x = x
    this.type = this.hitObject.type
    this.time = this.hitObject.time
    this.data = this.hitObject.data
  }

  public typestr(): string {
    return this.hitObject.typestr()
  }
}
