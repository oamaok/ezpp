import { HitType } from './hitType'

// x,y,time,type,hit sounds
export const REGEX = /^(\d+),(\d+),(\d+),(\d+),(\d+)/

/**
 * @param {string} rawBeatmap
 * @returns objects
 */
export const feed = (rawBeatmap) => {
  const result = []
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
      const time = match[3]
      const type = match[4]
      const hitSounds = match[5]
      /*
       * type (ObjectType, equivalent to ojsama.)
       * & 1 = circle
       * & 2 = slider
       * & 12 = spinner
       *
       * hs
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
      result.push({
        time,
        type,
        hitSounds,
        hitType: hitSounds & 8 ? HitType.Rim : HitType.Centre,
      })
    } catch (e) {
      console.error('Failed to read line "' + s + '"', match)
      throw new Error('Error trying to read "' + s + '"')
    }
  }
  return result
}
