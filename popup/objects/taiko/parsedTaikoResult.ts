import ParsedTaikoObject from './parsedTaikoObject'

export default class ParsedTaikoResult {
  public objects: Array<ParsedTaikoObject>

  public constructor(objects: Array<ParsedTaikoObject>) {
    this.objects = objects
  }
}
