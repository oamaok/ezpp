/* eslint-disable no-console */

export default class Console {
  public static log(s: any, ...params: any[]): void {
    if (__DEV__) console.log(s, ...params)
  }

  public static warn(s: any, ...params: any[]): void {
    if (__DEV__) console.warn(s, ...params)
  }

  public static error(s: any, ...params: any[]): void {
    if (__DEV__) console.error(s, ...params)
  }
}
