import { HitType } from './hitType'
import { ObjectType } from './objectType'
import ParsedTaikoObject from './parsedTaikoObject'
import ParsedTaikoResult from './parsedTaikoResult'

// x,y,time,type,hit sounds
export const REGEX = /^(\d+),(\d+),(\d+),(\d+),(\d+)/

export const feed = (rawBeatmap: string): ParsedTaikoResult => {
  const objects = [] as Array<ParsedTaikoObject>
  let doRead = false
  for (const s of rawBeatmap.split('\n')) {
    if (s.startsWith('[HitObjects]')) {
      doRead = true
      continue
    }
    if (!doRead) continue
    if (!REGEX.test(s)) continue
    const match = s.match(REGEX)
    try {
      const time: number = parseInt(match[3])
      const type: number = parseInt(match[4])
      const hitSounds: number = parseInt(match[5])
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
      objects.push(
        new ParsedTaikoObject(
          time,
          type,
          hitSounds,
          ObjectType.fromNumber(type),
          hitSounds & 8 ? HitType.Rim : HitType.Centre
        )
      )
    } catch (e) {
      console.error('Failed to read line "' + s + '"', match)
      throw new Error('Error trying to read "' + s + '"')
    }
  }
  return new ParsedTaikoResult(objects)
}
