import { hitobject } from 'ojsama'
import { HitType } from './hitType'
import { ObjectType } from './objectType'
import TaikoObject from './taikoObject'

export default class Swell extends TaikoObject {
  public requiredHits = 10
  public duration: number

  public constructor(
    hitObject: hitobject,
    hitType: HitType,
    hitSounds: number
  ) {
    super(hitObject, ObjectType.Swell, hitType, hitSounds)
  }

  public createNestedHitObjects(): void {
    super.createNestedHitObjects()
    for (let i = 0; i < this.requiredHits; i++) {
      this.addNested(
        new TaikoObject(
          this.hitObject,
          ObjectType.SwellTick,
          this.hitType,
          this.hitSounds
        )
      )
    }
  }
}
