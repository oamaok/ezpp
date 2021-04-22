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

export type BaseBeatmapSet = {
  artist: string
  artist_unicode: string
  title: string
  title_unicode: string
}

export type BeatmapSet = BaseBeatmapSet & {
  availability: {
    download_disabled: false
    more_information: string | null // https://osu.ppy.sh/beatmapsets/665562#osu/1413092
  }
  beatmap: Array<Beatmap>
  bpm: number
  can_be_hyped: boolean
  converts: Array<Beatmap>
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
  current_user_attributes: {
    can_delete: boolean
    can_edit_metadata: boolean
    can_hype: boolean
    can_hype_reason: string | null
    can_love: boolean
    can_remove_from_loved: boolean
    is_watching: boolean
    new_hype_time: number | null
    nomination_modes: Array<string> | null // osu, taiko, fruits, mania, or just null
    remaining_hype: number // usually 0-10
  }
  description: {
    description: string // HTML
  }
  discussion_enabled: boolean // false for forum based modding
  discussion_locked: boolean
  favourite_count: number
  genre: {
    id: number
    name: string // Anime, Pop, etc
  }
  has_havourited: boolean
  hype: {
    current: number
    required: number
  } | null
  id: number
  is_scoreable: boolean
  language: {
    id: number
    name: string // English, Japanese etc
  }
  last_updated: string // date, for example: 2020-10-25T10:47:18+00:00
  legacy_thread_url: string // forum url
  nominations_summary: {
    current: number
    required: number
  }
  nsfw: boolean // 'explicit' feature
  play_count: number
  preview_url: string // url to the mp3 file
  ranked: number
  ranked_date: string // date
  ratings: Array<number> // contains exactly 11 elements
  recent_favourites: Array<unknown> // contains User, but we don't use it so it has 'unknown' type
  source: string // can be empty string, but can never be null I guess
  status: string // wip, pending, ...
  storyboard: boolean
  submitted_date: string // date
  tags: string // space separated list
  user: unknown // again, we don't use user for now
  user_id: number
  video: boolean
}
