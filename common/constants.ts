export const BEATMAP_URL_REGEX = /^https?:\/\/(osu|new).ppy.sh\/([bs]|beatmapsets)\/(\d+)\/?(#(osu|taiko|fruits|mania)\/(\d+))?/i
export const SCORE_URL_REGEX = /^https?:\/\/(osu|new).ppy.sh\/scores\/(osu|taiko|fruits|mania)\/(\d+)/i

export const testRegex = (url: string) =>
  url.match(BEATMAP_URL_REGEX) || url.match(SCORE_URL_REGEX)

export const matchRegex = (
  url: string
): {
  pageType: pageType
  result: RegExpMatchArray
} | null => {
  const scoreMatch = url.match(SCORE_URL_REGEX)
  if (scoreMatch) {
    return { pageType: pageType.Score, result: scoreMatch }
  }
  const beatmapMatch = url.match(BEATMAP_URL_REGEX)
  if (beatmapMatch) {
    return { pageType: pageType.Beatmap, result: beatmapMatch }
  }
  return null
}

export enum pageType {
  LegacyBeatmap,
  Beatmap,
  Score,
}
