/**
 * Each timing point influences a specified portion of the
 * map, commonly called a "timing section". The .osu file
 * format requires these to be sorted in chronological order.
 */
export type TimingPoint = {
  /**
   * Start time of the timing section, in milliseconds from
   * the beginning of the beatmap's audio. The end of the
   * timing section is the next timing point's time (or
   * never, if this is the last timing point).
   */
  time: number

  /**
   * For uninherited timing points, the duration of a beat,
   * in milliseconds.
   *
   * For inherited timing points, a negative inverse slider
   * velocity multiplier, as a percentage. For example, -50
   * would make all sliders in this timing section twice as
   * fast as SliderMultiplier.
   */
  beatLength: number

  /**
   * Slider multiplier for this timing point. If the
   * beatLength is -50, this property returns 2 (means 2x
   * slider velocity for this timing point).
   *
   * This property will return 1 for uninherited timing points.
   */
  sliderMultiplier: number

  /**
   * Amount of beats in a measure. Inherited timing points
   * ignore this property.
   */
  meter: number

  /**
   * Default sample set for hit objects (0 = beatmap default,
   * 1 = normal, 2 = soft, 3 = drum).
   */
  sampleSet: number

  /**
   * Custom sample index for hit objects. 0 indicates osu!'s
   * default hitsounds.
   */
  sampleIndex: number

  /**
   * Volume percentage for hit objects.
   */
  volume: number

  /**
   * Whether or not the timing point is uninherited.
   */
  uninherited: boolean

  /**
   * Bit flags that give the timing point extra effects.
   * https://osu.ppy.sh/wiki/en/osu%21_File_Formats/Osu_%28file_format%29#effects
   */
  effects: number
}
