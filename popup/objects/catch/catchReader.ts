// osu!catch's play field only uses the x-axis, so y is not relevant.
import { ObjectType } from './objectType'
import { ParsedCatchObject } from './parsedCatchObject'
import { ParsedCatchResult } from './parsedCatchResult'

// x,y,time,type,hit sounds
export const REGEX = /^(\d+),(\d+),(\d+),(\d+),(\d+)/

export const feed = (rawBeatmap: string): ParsedCatchResult => {
  const objects = [] as Array<ParsedCatchObject>
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
      /*
       * type (ObjectType, equivalent to ojsama.)
       * & 1 = circle - fruit
       * & 2 = slider - juice stream
       * & 8 = spinner - tiny droplet
       */
      objects.push({
        time,
        type,
        hitSounds,
        objectType: ObjectType.fromNumber(type),
      })
    } catch (e) {
      throw new Error('Error trying to read "' + s + '"')
    }
  })
  return { objects }
}
