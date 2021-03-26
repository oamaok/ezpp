import { beatmap, hitobject, slider } from 'ojsama'
import { beatmaps } from '../../util/beatmaps'
import SliderEventDescriptor from '../sliderEventDescriptor'
import SliderEventGenerator from '../sliderEventGenerator'
import CatchObject from './catchObject'
import { ObjectType } from './objectType'

export const BASE_SCORING_DISTANCE = 100

export default class JuiceStream extends CatchObject {
  public velocity: number
  public tickDistance: number
  public legacyLastTickOffset?: number

  public constructor(
    hitObject: hitobject,
    objectType: ObjectType,
    hitSounds: number,
    x: number
  ) {
    super(hitObject, objectType, hitSounds, x)
  }

  public applyDefaultsToSelf(map: beatmap): void {
    const scoringDistance =
      BASE_SCORING_DISTANCE *
      map.tick_rate *
      beatmaps.getSpeedMultiplierAt(map, this.time)
    const timing = beatmaps.getTimingPointAt(map, this.time)
    this.velocity = scoringDistance / timing.ms_per_beat // ms_per_beat = BeatLength? see JuiceStream.cs:45
    this.tickDistance = scoringDistance / map.tick_rate // tick_rate = SliderTickRate
  }

  public createNestedHitObjects() {
    // dropletSamples here in osu!lazer code, but we don't need because we don't care about hit sounds
    let nodeIndex = 0
    let lastEvent: SliderEventDescriptor | undefined
    SliderEventGenerator.generate(
      this.time,
      this.spanDuration,
      this.velocity,
      this.tickDistance,
      this.slider.distance,
      this.spanCount,
      this.legacyLastTickOffset
    ).forEach((e) => {
      if (lastEvent) {
        const sinceLastTick = e.time - lastEvent.time

        if (sinceLastTick > 80) {
          let timeBetweenTiny = sinceLastTick
          while (timeBetweenTiny > 100) timeBetweenTiny /= 2
          for (
            let t = timeBetweenTiny;
            t < sinceLastTick;
            t += timeBetweenTiny
          ) {
            //this.addNested(new CatchObject(, ObjectType.TinyDroplet, 0, this.originalX))
          }
        }
      }
    })
  }

  public get slider(): slider {
    return this.hitObject.data as slider
  }

  public get spanCount(): number {
    return this.slider.repetitions
  }

  public get duration(): number {
    return this.spanCount + this.slider.distance / this.velocity
  }

  public get endTime(): number {
    return this.time + this.duration
  }

  public get spanDuration(): number {
    return this.duration / this.spanCount
  }
}
