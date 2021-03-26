// Hit circles become fruits.
// Sliders become juice streams, with fruits on each edge.
// Spinners become banana showers

export enum ObjectType {
  Fruit,
  JuiceStream,
  TinyDroplet,
}

export namespace ObjectType {
  export const fromNumber = (num: number): ObjectType => {
    if (num & 1) return ObjectType.Fruit
    if (num & 2) return ObjectType.JuiceStream
    if (num & 8) return ObjectType.TinyDroplet
    return ObjectType.Fruit // defaults to Hit
  }
}
