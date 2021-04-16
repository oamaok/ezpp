export type Beatmap = {
  accuracy: number
  ar: number
  beatmapset_id: number
  bpm: number
  checksum: string
  convert: boolean
  count_circles: number
  count_sliders: number
  count_spinners: number
  cs: number
  deleted_at?: Date
  difficulty_rating: number
  drain: number
  failtimes: {
    fail: Array<number>
    exit: Array<number>
  }
  hit_length: number
  id: number
  is_scoreable: boolean
  last_updated: string
  max_combo: number | null
  mode: 'osu' | 'taiko' | 'fruits' | 'mania'
  mode_int: 0 | 1 | 2 | 3
  passcount: number
  playcount: number
  ranked: number
  status:
    | 'ranked'
    | 'loved'
    | 'graveyard'
    | 'wip'
    | 'pending'
    | 'qualified'
    | 'approved'
  total_length: number
  url: string
  version: string
}

// does not contain "convert" or something
export type PartialBeatmapset = {
  artist: string
  artist_unicode: string // note: it was nullable but it is now non-null since https://osu.ppy.sh/home/changelog/web/2021.330.0
  covers: {
    'card': string
    'card@2x': string
    'cover': string
    'cover@2x': string
    'list': string
    'list@2x': string
    'slimcover': string
    'slimcover@2x': string
  }
  creator: string
  favourite_count: number
  hype: {
    current: number
    required: number
  } | null
  id: number
  nsfw: boolean
  play_count: number
  preview_url: string // equivalent to `//b.ppy.sh/preview/${id}.mp3`
  source: string
  status:
    | 'ranked'
    | 'loved'
    | 'graveyard'
    | 'wip'
    | 'pending'
    | 'qualified'
    | 'approved'
  title: string
  title_unicode: string
  user_id: number
  video: boolean
}
