import TaikoObject from '../objects/taiko/taikoObject'
import ojsama from 'ojsama'

export const LEGACY_VELOCITY_MULTIPLIER = 1.4
export const BASE_SCORING_DISTANCE = 100

export const convertHitObjects = (
  objects: Array<TaikoObject>,
  map: ojsama.beatmap
): Array<TaikoObject> => {
  // not executed because star rating calculation for conversion maps are disabled
  const result: Array<TaikoObject> = []
  objects.forEach((obj) => {
    convertHitObject(obj, map).forEach((e) => {
      result.push(e)
    })
  })
  return result.sort((a, b) => a.time - b.time)
}

export const convertHitObject = (obj: TaikoObject, map: ojsama.beatmap) => {
  const result = [obj]
  const strong = obj.hitSounds & 4
  if (obj.type & ojsama.objtypes.slider) {
  }
  return result
}

export const shouldConvertSliderToHits = (
  obj: TaikoObject,
  map: ojsama.beatmap
) => {
  // from osu!lazer source code:
  // DO NOT CHANGE OR REFACTOR ANYTHING IN HERE WITHOUT TESTING AGAINST _ALL_ BEATMAPS.
  // Some of these calculations look redundant, but they are not - extremely small floating point errors are introduced to maintain 1:1 compatibility with stable.
  // Rounding cannot be used as an alternative since the error deltas have been observed to be between 1e-2 and 1e-6.

  const slider = obj.hitObject.data as ojsama.slider

  // The true distance, accounting for any repeats. This ends up being the drum roll distance later
  const spans = slider.repetitions + 1 || 1
  const distance = slider.distance * spans * LEGACY_VELOCITY_MULTIPLIER

  const timingPoint = getNearestTimingPoint(map, obj.time)
  const difficultyPoint = { speedMultiplier: 0.0 } // getDifficultyPoint(map, obj.time) // TODO: what is difficulty point... (it is invoking undefined function so it will be an error)

  let beatLength = timingPoint.ms_per_beat / difficultyPoint.speedMultiplier

  let sliderScoringPointDistance =
    (BASE_SCORING_DISTANCE * map.sv) / map.tick_rate

  const taikoVelocity = sliderScoringPointDistance * map.tick_rate
  const taikoDuration = ((distance / taikoVelocity) * beatLength) | 0
  const osuVelocity = taikoVelocity * (1000 / beatLength)

  if (map.format_version >= 8) {
    beatLength = timingPoint.ms_per_beat
  }

  const tickSpacing = Math.min(
    beatLength / map.tick_rate,
    taikoDuration / spans
  )

  return {
    shouldConvertSliderToHits:
      tickSpacing > 0 && (distance / osuVelocity) * 1000 < 2 * beatLength,
    taikoDuration,
    tickSpacing,
  }
}

export const getNearestTimingPoint = (
  map: ojsama.beatmap,
  time: number
): ojsama.timing => {
  let i = Number.MAX_VALUE
  let value: ojsama.timing = map.timing_points[0] // default
  map.timing_points.forEach((timing) => {
    let n = Math.abs(timing.time - time)
    if (n < i) {
      i = n
      value = timing
    }
  })
  return value
}
