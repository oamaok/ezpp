/**
 * An utility class to read string easily.
 * Note: This class is *not* for reading multiline text.
 */
export default class StringReader {
  /**
   * @param {string} text
   */
  constructor(text) {
    this.text = text
    this.index = 0
  }

  /**
   * Returns the chat at the current index. (Does not increment the index)
   * @returns the chat at the current index
   */
  peek() {
    return this.text.charAt(this.index)
  }

  /**
   * Reads the remaining text, but does not increment the index.
   * @returns the remaining text
   */
  read() {
    return this.text.substring(this.index)
  }

  /**
   * Substrings the remaining text with start = index, end = index + amount. It does increment the index.
   * @param {number} amount the amount to read
   * @returns substr'd text
   */
  read(amount) {
    const s = this.text.substring(this.index, this.index + amount)
    this.index += amount
    return s
  }

  /**
   * Checks if the remaining text starts with prefix. Equivalent to read().startsWith(prefix).
   * @param {string} prefix the prefix to check
   */
  startsWith(prefix) {
    this.read().startsWith(prefix)
  }

  /**
   * Skips the index by specified amount. It can be negative value to decrement the index.
   * @param {number} amount
   * @returns this instance
   */
  skip(amount) {
    this.index += amount
    return this
  }

  /**
   * Returns whether the text has reached EOF.
   * @returns whether the text has reached EOF.
   */
  isEOF() {
    return this.index >= this.text.length
  }
}
