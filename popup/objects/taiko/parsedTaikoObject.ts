import { HitType } from './hitType'
import { ObjectType } from './objectType'

export default class ParsedTaikoObject {
  public time: number
  public type: number
  public hitSounds: number
  public objectType: ObjectType
  public hitType: HitType

  public constructor(
    time: number,
    type: number,
    hitSounds: number,
    objectType: ObjectType,
    hitType: HitType
  ) {
    this.time - time
    this.type = type
    this.hitSounds = hitSounds
    this.objectType = objectType
    this.hitType = hitType
  }
}
