import Mth from '../util/mth'
import SliderEventDescriptor from './sliderEventDescriptor'
import { SliderEventType } from './sliderEventType'

// comment from osu!lazer:
// A very lenient maximum length of a slider for ticks to be generated.
// This exists for edge cases such as b/1573664 where the beatmap has been edited by the user, and should never be reached in normal usage.
export const MAX_LENGTH = 100000

export default class SliderEventGenerator {
  public static generate(
    startTime: number,
    spanDuration: number,
    velocity: number,
    tickDistance: number,
    totalDistance: number,
    spanCount: number,
    legacyLastTickOffset?: number
  ): Array<SliderEventDescriptor> {
    const result: Array<SliderEventDescriptor> = []

    const length = Math.min(MAX_LENGTH, totalDistance)
    tickDistance = Mth.clamp(tickDistance, 0, length)

    const minDistanceFromEnd = velocity * 10

    result.push(
      new SliderEventDescriptor(
        SliderEventType.Head,
        0,
        startTime,
        startTime,
        0
      )
    )

    if (tickDistance !== 0) {
      for (let span = 0; span < spanCount; span++) {
        const spanStartTime = startTime + span * spanDuration
        const reversed = span % 2 === 1

        const ticks: Array<SliderEventDescriptor> = SliderEventGenerator.generateTicks(
          span,
          spanStartTime,
          spanDuration,
          reversed,
          length,
          tickDistance,
          minDistanceFromEnd
        )

        if (reversed) ticks.reverse()

        result.push(...ticks)

        if (span < spanCount - 1) {
          result.push(
            new SliderEventDescriptor(
              SliderEventType.Repeat,
              span,
              startTime + span * spanDuration,
              spanStartTime + spanDuration,
              (span + 1) % 2
            )
          )
        }
      }
    }

    const totalDuration = spanCount * spanDuration

    // Okay, I'll level with you. I made a mistake. It was 2007.
    // Times were simpler. osu! was but in its infancy and sliders were a new concept.
    // A hack was made, which has unfortunately lived through until this day.
    //
    // This legacy tick is used for some calculations and judgements where audio output is not required.
    // Generally we are keeping this around just for difficulty compatibility.
    // Optimistically we do not want to ever use this for anything user-facing going forwards.

    const finalSpanIndex = spanCount - 1
    const finalSpanStartTime = startTime + finalSpanIndex * spanDuration
    const finalSpanEndTime = Math.max(
      startTime + totalDuration / 2,
      finalSpanStartTime + spanDuration - (legacyLastTickOffset ?? 0)
    )
    let finalProgress = (finalSpanEndTime - finalSpanStartTime) / spanDuration

    if (spanCount % 2 === 0) finalProgress = 1 - finalProgress

    result.push(
      new SliderEventDescriptor(
        SliderEventType.LegacyLastTick,
        finalSpanIndex,
        finalSpanStartTime,
        finalSpanEndTime,
        finalProgress
      )
    )

    result.push(
      new SliderEventDescriptor(
        SliderEventType.Tail,
        finalSpanIndex,
        startTime + (spanCount - 1) * spanDuration,
        startTime + totalDuration,
        spanCount % 2
      )
    )

    return result
  }

  public static generateTicks(
    spanIndex: number,
    spanStartTime: number,
    spanDuration: number,
    reversed: boolean,
    length: number,
    tickDistance: number,
    minDistanceFromEnd: number
  ): Array<SliderEventDescriptor> {
    const result: Array<SliderEventDescriptor> = []
    for (let d = tickDistance; d < length; d += tickDistance) {
      if (d >= length - minDistanceFromEnd) break
      const pathProgress = d / length
      const timeProgress = reversed ? 1 - pathProgress : pathProgress
      result.push(
        new SliderEventDescriptor(
          SliderEventType.Tick,
          spanIndex,
          spanStartTime,
          spanStartTime + timeProgress * spanDuration,
          pathProgress
        )
      )
    }
    return result
  }
}
