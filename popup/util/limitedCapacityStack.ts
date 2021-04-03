export default class LimitedCapacityStack<T> {
  #count: number = 0
  public readonly array: Array<T>
  public readonly capacity: number
  private marker: number

  public constructor(capacity: number) {
    if (capacity < 0) throw new Error('Index out of bounds: ' + capacity)
    this.capacity = capacity
    this.array = new Array<T>(capacity)
    this.marker = capacity // Set marker to the end of the array, outside of the indexed range by one.
  }

  public get(index: number): T {
    if (index < 0 || index >= this.count)
      throw new Error(
        `Index out of bounds; Index: ${index}, Count: ${this.count}`
      )
    index += this.marker
    if (index > this.capacity - 1) {
      index -= this.capacity
    }
    return this.array[index]
  }

  public push(item: T): void {
    if (this.marker === 0) this.marker = this.capacity - 1
    else --this.marker

    this.array[this.marker] = item

    if (this.count < this.capacity) {
      ++this.#count
    }
  }

  public get count(): number {
    return this.#count
  }
}
