import Console from '../../util/console'
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

export const SLIDER_REGEX = /^(\d+),(\d+),(\d+),(\d+),(\d+),(.*?),(\d+),(.*?),(.*?),/
//                            ^     ^     ^     ^     ^     ^     ^     ^     ^
//                           x[1]  y[2] time[3] |     |  extra[6] | length[8] |
//                                           type[4]  |        slides[7] edgeSounds[9]
//                                               hitSounds[5]
// extra: curveType|curvePoints
// curveType: character
// curvePoints: pipe-separated list of strings
// slides: integer
// length: decimal
// edgeSounds: pipe-separated list of integers

export const feed = (
  rawBeatmap: string,
  convert: boolean
): ParsedTaikoResult => {
  const objects = [] as Array<ParsedTaikoObject>
  let doRead = false
  rawBeatmap.split('\n').forEach((s) => {
    if (s.startsWith('[HitObjects]')) {
      doRead = true
      return
    }
    if (!doRead || s.length === 0) return
    let isSlider = convert && s.includes('|')
    let match = isSlider ? s.match(SLIDER_REGEX) : s.match(REGEX)
    if (!match) {
      if (isSlider) {
        match = s.match(REGEX)
        isSlider = false
      }
      if (!match) {
        Console.warn('Did not match the regex for the input: ' + s) // can be useful for debugging
        return
      }
    }
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
      const edgeSounds = new Array<number>()
      if (isSlider) {
        edgeSounds.push(...match[9].split('|').map((s) => parseInt(s)))
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
        hitType: hitSounds & 8 || hitSounds & 2 ? HitType.Rim : HitType.Centre,
        spinnerEndTime,
        edgeSounds,
        typestr: () => type.toString(), // we don't use typestr anyway
      })
    } catch (e) {
      Console.error('Error trying to read "' + s + '"')
      throw e
    }
  })
  return { objects }
}
