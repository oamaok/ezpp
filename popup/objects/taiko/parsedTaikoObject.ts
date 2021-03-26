import { HitType } from './hitType'
import { ObjectType } from './objectType'

export type ParsedTaikoObject = {
  time: number
  type: number
  hitSounds: number
  objectType: ObjectType
  hitType: HitType
  spinnerEndTime?: number
  typestr: () => string
}
