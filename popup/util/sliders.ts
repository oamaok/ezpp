import { slider } from 'ojsama'
import Mth from './mth'

export namespace sliders {
  export const progressToDistance = (
    slider: slider,
    progress: number
  ): number => {
    return Mth.clamp(progress, 0, 1) * slider.distance
  }
}
