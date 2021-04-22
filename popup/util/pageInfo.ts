import { BaseBeatmapSet, Beatmap, BeatmapSet } from './beatmap'

export type PageInfo = {
  isOldSite: boolean
  beatmapSetId: string
  beatmapId: string
  beatmap: Beatmap
  beatmapInfo: BaseBeatmapSet | BeatmapSet
  convert?: {
    difficulty_rating: 0
    mode: 'taiko' | 'fruits' | 'mania'
  }
  mode: 'osu' | 'taiko' | 'fruits' | 'mania'
}
