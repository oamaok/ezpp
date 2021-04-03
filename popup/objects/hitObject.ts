import { hitobject } from 'ojsama'

export default class HitObject {
  public hitObject: hitobject
  public hitSounds: number
  public nestedHitObjects = new Array<HitObject>()

  constructor(hitObject: hitobject, hitSounds: number) {
    this.hitObject = hitObject
    this.hitSounds = hitSounds
  }

  public createNestedHitObjects(): void {}

  public addNested(hitObject: HitObject) {
    this.nestedHitObjects.push(hitObject)
  }
}
