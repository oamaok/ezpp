import { TimingPoint } from './timingPoint'

// this regex is hard to understand, so i put a comment below.
export const REGEX = /^(\d+),(.*?),(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)/
//                     ^     ^     ^     ^     ^     ^     ^     ^
//                  time[1]  |  meter[3] |     | volume[6] |  effects[8]
//                    beatLength[2]      |     |      uninherited[7]
//                                sampleSet[4] |
//                                        sampleIndex[5]

export const feed = (rawBeatmap: string): Array<TimingPoint> => {
  const timings = [] as Array<TimingPoint>
  let doRead = false
  rawBeatmap.split('\n').forEach((s) => {
    if (s.startsWith('[TimingPoints]')) {
      doRead = true
      return
    }
    if (doRead && s.startsWith('[')) doRead = false
    if (!doRead) return
    const match = s.match(REGEX)
    if (!match) return
    try {
      timings.push({
        time: parseInt(match[1]),
        beatLength: parseFloat(match[1]),
        sliderMultiplier: parseInt(match[7]) ? 1 : -100 / parseFloat(match[1]),
        meter: parseInt(match[3]),
        sampleSet: parseInt(match[4]),
        sampleIndex: parseInt(match[5]),
        volume: parseInt(match[6]),
        uninherited: parseInt(match[7]) === 1,
        effects: parseInt(match[8]),
      })
    } catch (e) {
      throw new Error('Error trying to read "' + s + '"')
    }
  })
  return timings
}
