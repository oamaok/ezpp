export default class Arrays<T> extends Array<T> {
  public constructor(...array: Array<T>) {
    super(...array)
  }

  public count(
    filterFunction: (value: T, index: number, array: Array<T>) => boolean
  ): number {
    return this.filter(filterFunction).length
  }

  public filter(
    predicate: (value: T, index: number, array: T[]) => unknown
  ): Arrays<T> {
    return new Arrays(...super.filter(predicate))
  }

  public map<U>(
    callbackfn: (value: T, index: number, array: T[]) => U
  ): Arrays<U> {
    return new Arrays(...super.map(callbackfn))
  }

  public static copyArray<E>(array: E[]): E[] {
    return [...array]
  }
}
