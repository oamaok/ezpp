export enum ObjectType {
  Hit, // = Hit (Circle)
  DrumRoll, // = Slider
  Swell, // = Spinner
  SwellTick, // = ?
}

export namespace ObjectType {
  export const fromNumber = (num: number): ObjectType => {
    if (num & 1) return ObjectType.Hit
    if (num & 2) return ObjectType.DrumRoll
    if (num & 12) return ObjectType.Swell
    return ObjectType.Hit // defaults to Hit
  }
}
