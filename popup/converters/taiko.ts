import TaikoObject from '../objects/taiko/taikoObject'
import ojsama, { slider } from 'ojsama'
import { beatmaps } from '../util/beatmaps'
import { Precision } from '../util/precision'
import { ObjectType } from '../objects/taiko/objectType'
import Mth from '../util/mth'
import Swell from '../objects/taiko/swell'
import { HitType } from '../objects/taiko/hitType'
import Console from '../util/console'

// Do NOT remove Math.fround, this is VERY IMPORTANT.
// taiko conversion will fail if you remove Math.fround.
export const LEGACY_VELOCITY_MULTIPLIER = Math.fround(1.4)
export const BASE_SCORING_DISTANCE = Math.fround(100)
export const SWELL_HIT_MULTIPLIER = Math.fround(1.65)

export const convertHitObjects = (
  objects: Array<TaikoObject>,
  map: ojsama.beatmap,
  mods: number,
  isForCurrentRuleset: boolean
): Array<TaikoObject> => {
  const result = objects.flatMap((obj) =>
    convertHitObject(obj, map, mods, isForCurrentRuleset)
  )
  Console.log(
    'Sliders:',
    result.filter((e) => e.objectType === ObjectType.DrumRoll)
  )
  Console.log('All objects:', result)
  return result.sort((a, b) => a.time - b.time)
}

export const convertHitObject = (
  obj: TaikoObject,
  map: ojsama.beatmap,
  mods: number,
  isForCurrentRuleset: boolean
): Array<TaikoObject> => {
  const result: Array<TaikoObject> = []
  // const strong = obj.hitSounds & 4 // we don't need this thing
  if (obj.type & ojsama.objtypes.slider) {
    const res = shouldConvertSliderToHits(obj, map, mods, isForCurrentRuleset)
    if (res.shouldConvertSliderToHits) {
      let i = 0
      for (
        let j = obj.time;
        j <= obj.time + res.taikoDuration + res.tickSpacing / 8;
        j += res.tickSpacing
      ) {
        let hitSounds = obj.edgeSounds[i] || 0
        const hitType =
          hitSounds & 8 || hitSounds & 2 ? HitType.Rim : HitType.Centre
        const taikoObject = new TaikoObject(
          {
            time: j,
            type: obj.type,
            typestr: obj.typestr,
          },
          ObjectType.Hit,
          hitType,
          obj.hitSounds,
          []
        )
        taikoObject.time = j
        result.push(taikoObject)

        i = (i + 1) % obj.edgeSounds.length

        if (Precision.almostEquals(0, res.tickSpacing)) break
      }
    } else {
      const taikoObject = new TaikoObject(
        obj.hitObject,
        ObjectType.DrumRoll,
        obj.hitType,
        obj.hitSounds,
        []
      )
      const sl = obj.data as slider
      taikoObject.data = {
        pos: sl.pos,
        distance: sl.distance,
        repetitions: sl.repetitions,
      }
      result.push(taikoObject)
    }
  } else if (obj.type & ojsama.objtypes.spinner) {
    const hitMultiplier =
      Mth.difficultyRange(Math.fround(map.od), 3, 5, 7.5) * SWELL_HIT_MULTIPLIER

    const swell = new Swell(obj.hitObject, obj.hitType, obj.hitSounds)
    swell.duration = swell.spinnerEndTime! - swell.time
    swell.requiredHits =
      Math.max(1, (swell.duration / 1000) * hitMultiplier) | 0
    result.push(swell)
  } else {
    result.push(obj) // obj type is circle
  }
  return result
}

export const shouldConvertSliderToHits = (
  obj: TaikoObject,
  map: ojsama.beatmap,
  mods: number,
  isForCurrentRuleset: boolean
) => {
  // DO NOT CHANGE OR REFACTOR ANYTHING IN HERE WITHOUT TESTING AGAINST _ALL_ BEATMAPS.
  // Some of these calculations look redundant, but they are not - extremely small floating point errors are introduced to maintain 1:1 compatibility with stable.
  // Rounding cannot be used as an alternative since the error deltas have been observed to be between 1e-2 and 1e-6.
  // You should not remove Math.fround, or you'll see wrong result!

  const slider = obj.hitObject.data as ojsama.slider

  // The true distance, accounting for any repeats. This ends up being the drum roll distance later
  const spans = slider.repetitions ?? 1
  const distance = slider.distance * spans * LEGACY_VELOCITY_MULTIPLIER

  const ms_per_beat = beatmaps.getMsPerBeatAt(map, obj.time)
  const speedMultiplier = beatmaps.getSpeedMultiplierAt(map, obj.time)

  let beatLength = ms_per_beat / speedMultiplier

  let sliderScoringPointDistance =
    (BASE_SCORING_DISTANCE * (map.sv * LEGACY_VELOCITY_MULTIPLIER)) /
    map.tick_rate

  const taikoVelocity = sliderScoringPointDistance * map.tick_rate
  const taikoDuration = ((distance / taikoVelocity) * beatLength) | 0

  if (isForCurrentRuleset) {
    return {
      shouldConvertSliderToHits: false,
      taikoDuration,
      tickSpacing: 0,
    }
  }

  const osuVelocity = taikoVelocity * (1000 / beatLength)

  const bL2 = beatLength
  if (map.format_version >= 8) {
    beatLength = ms_per_beat
  }

  const tickSpacing = Math.min(
    beatLength / map.tick_rate,
    taikoDuration / spans
  )

  /*
  Console.log(
    `${obj.time}: s: ${spans}, d: ${distance}, bL: ${beatLength}, bL2: ${bL2}, bbL: ${ms_per_beat}, tV: ${taikoVelocity}, tD: ${taikoDuration}, sspd: ${sliderScoringPointDistance}, oV: ${osuVelocity}, tS: ${tickSpacing}, spMul: ${speedMultiplier}, data:`,
    obj,
    ', timings:'
  )
  */

  return {
    shouldConvertSliderToHits:
      tickSpacing > 0 && (distance / osuVelocity) * 1000 < 2 * beatLength,
    taikoDuration,
    tickSpacing,
  }
}
