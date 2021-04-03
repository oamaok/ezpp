export default class LimitedCapacityQueue<T> {
  public readonly capacity: number
  private readonly array: Array<T>

  // Markers tracking the queue's first and last element.
  private start = 0
  private end = -1

  /**
   * The number of elements in the queue.
   */
  public count = 0

  /**
   * @param capacity The number of items the queue can hold.
   */
  constructor(capacity: number) {
    if (capacity < 0) throw new Error('Invalid capacity: ' + capacity)
    this.capacity = capacity
    this.array = new Array(capacity)
    this.clear()
  }

  /**
   * Removes all elements from the LimitedCapacityQueue.
   */
  public clear(): void {
    this.start = 0
    this.end = -1
    this.count = 0
  }

  /**
   * Whether the queue is full (adding any new items will cause removing existing ones).
   */
  public get full(): boolean {
    return this.count === this.capacity
  }

  /**
   * Removes an item from the front of the LimitedCapacityQueue.
   * @returns The item removed from the front of the queue.
   */
  public dequeue(): T {
    if (this.count === 0) throw new Error('Queue is empty.')
    const result = this.array[this.start]
    this.start = (this.start + 1) % this.capacity
    this.count--
    return result
  }

  /**
   * Adds an item to the back of the LimitedCapacityQueue.
   * If the queue is holding [count] elements at the point of addition,
   * the item at the front of the queue will be dropped.
   * @param item The item to be added to the back of the queue.
   */
  public enqueue(item: T): void {
    this.end = (this.end + 1) % this.capacity
    if (this.count === this.capacity) {
      this.start = (this.start + 1) % this.capacity
    } else {
      this.count++
    }
    this.array[this.end] = item
  }

  /**
   * Retrieves the item at the given index in the queue.
   * @param index The index of the item to retrieve.
   * The item with index 0 is at the front of the queue (it was added the earliest).
   */
  public get(index: number): T {
    if (index < 0 || index >= this.count)
      throw new Error(`
        Index out of bounds; Index: ${index}, Count: ${this.count}`)
    return this.array[(this.start + index) % this.capacity]
  }

  public forEach(action: (value: T) => void): void {
    this.getArray().forEach((e) => action(e))
  }

  // throws error if T isn't a number
  public min(): number {
    let n = Number.MAX_VALUE
    this.forEach((e) => {
      const c = (e as unknown) as number
      if (isNaN(c)) throw new Error(e + ' is not a number')
      if (n > c) n = c
    })
    return n
  }

  public getArray(): Array<T> {
    if (this.count === 0) return []
    const res: Array<T> = []
    for (let i = 0; i < this.count; i++) {
      res.push(this.array[(this.start + i) % this.capacity])
    }
    return res
  }
}
