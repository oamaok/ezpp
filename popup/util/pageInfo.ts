import { Beatmap } from './beatmap'

export type PageInfo = {
  isOldSite: boolean
  beatmapSetId: string
  beatmapId: string
  beatmap: Beatmap
  convert?: {
    difficulty_rating: 0
    mode: 'taiko' | 'fruits' | 'mania'
  }
  mode: 'osu' | 'taiko' | 'fruits' | 'mania'
}
