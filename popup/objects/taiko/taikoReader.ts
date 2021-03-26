import { HitType } from './hitType'
import { ObjectType } from './objectType'
import { ParsedTaikoObject } from './parsedTaikoObject'
import { ParsedTaikoResult } from './parsedTaikoResult'

// x,y,time,type,hit sounds,extra
export const REGEX = /^(\d+),(\d+),(\d+),(\d+),(\d+),?(.*?)?,?/
//                     ^     ^     ^     ^     ^     ^
//                    x[1]  y[2] time[3] |     |  extra[6]
//                                    type[4]  |
//                                       hitSounds[5]

export const feed = (rawBeatmap: string): ParsedTaikoResult => {
  const objects = [] as Array<ParsedTaikoObject>
  let doRead = false
  rawBeatmap.split('\n').forEach((s) => {
    if (s.startsWith('[HitObjects]')) {
      doRead = true
      return
    }
    if (!doRead) return
    const match = s.match(REGEX)
    if (!match) return
    try {
      const time: number = parseInt(match[3])
      const type: number = parseInt(match[4])
      const hitSounds: number = parseInt(match[5])
      const extra: string | undefined = match[6]
      const objectType = ObjectType.fromNumber(type)
      let spinnerEndTime: number | undefined
      if (objectType === ObjectType.Swell) {
        spinnerEndTime = parseInt(extra)
      }
      /*
       * type (ObjectType, equivalent to ojsama.)
       * & 1 = circle
       * & 2 = slider
       * & 12 = spinner
       *
       * hitSounds
       * 0 = red (centre)
       * 4 = big red (centre)
       * 8 = blue (rim)
       * 12 = big blue (rim)
       *
       * or:
       * 0 = red (dons) (centre)
       * & 4 = big
       * & 8 = blue (kats) (rim)
       */
      objects.push({
        time,
        type,
        hitSounds,
        objectType,
        hitType: hitSounds & 8 ? HitType.Rim : HitType.Centre,
        spinnerEndTime,
        typestr: () => type.toString(), // we don't use typestr anyway
      })
    } catch (e) {
      throw new Error('Error trying to read "' + s + '"')
    }
  })
  return { objects }
}
