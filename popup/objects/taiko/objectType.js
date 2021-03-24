export const ObjectType = {
  Hit: 1,
  Slider: 2,
  Spinner: 12,
}

export const fromNumber = (num) => {
  if (num === 1) return Hit
  if (num === 2) return Slider
  if (num === 12) return Spinner
  return -1
}
