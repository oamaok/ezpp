import { SliderEventType } from './sliderEventType'

export default class SliderEventDescriptor {
  public type: SliderEventType
  public time: number
  public spanIndex: number
  public spanStartTime: number
  public pathProgress: number

  public constructor(
    type: SliderEventType,
    time: number,
    spanIndex: number,
    spanStartTime: number,
    pathProgress: number
  ) {
    this.type = type
    this.time = time
    this.spanIndex = spanIndex
    this.spanStartTime = spanStartTime
    this.pathProgress = pathProgress
  }
}
