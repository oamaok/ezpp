export enum ObjectType {
  Hit,
  Slider,
  Spinner,
}

export namespace ObjectType {
  export const fromNumber = (num: number): ObjectType => {
    if (num & 1) return ObjectType.Hit
    if (num & 2) return ObjectType.Slider
    if (num & 12) return ObjectType.Spinner
    return ObjectType.Hit // defaults to Hit
  }
}
