import { Beatmap, PartialBeatmapset } from './beatmap'

export type Mod =
  | 'EZ' // Easy
  | 'NF' // No Fail
  | 'HT' // Half Time
  | 'HR' // Hard Rock
  | 'SD' // Sudden Death
  | 'PF' // Perfect
  | 'DT' // Double Time
  | 'NC' // Nightcore
  | 'HD' // Hidden
  | 'FL' // Flash light
  | 'RX' // Relax
  | 'AP' // Auto Pilot
  | 'TP' // Target Practice (exists in cutting edge but unranked)
  | 'SO' // Spun Out

export type Rank = 'XH' | 'X' | 'SH' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export type ScoreData = {
  id: number
  user_id: number
  accuracy: number // 1 = 100%, 0.5 = 50%
  mods: Array<Mod>
  score: number
  beatmap: Beatmap
  beatmapset: PartialBeatmapset
  best_id: number
  created_at: string // can be converted to Date object using: new Date(created_at)
  max_combo: number
  mode: 'osu' | 'taiko' | 'fruits' | 'mania'
  mode_int: 0 | 1 | 2 | 3
  perfect: boolean // full combo or not
  pp: number | null // null = not a top play or unranked map
  rank: Rank
  replay: boolean // true = replay available; false = replay unavailable
  rank_country: number
  rank_global: number
  statistics: {
    count_50: number
    count_100: number
    count_300: number
    count_geki: number
    count_katu: number
    count_miss: number
  }
  user: {
    avatar_url: string
    country: {
      code: string // two letters (SH)
      name: string // country name (Saint Helena)
    }
    country_code: string // two letters
    cover: {
      custom_url: string
      id: null // always null?
      url: string
    }
    default_group: string // most users are 'default'
    groups: Array<{
      colour: string // example: #EB8C47
      description: string
      id: number
      identifier: string // example: nat
      is_probationary: boolean
      name: string // example: Nomination Assessment Team
      playmodes: Array<'osu' | 'taiko' | 'fruits' | 'mania'> | null
      short_name: string // example: NAT
    }>
    id: number
    is_active: boolean
    is_bot: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean
    last_visit: string
    pm_friends_only: boolean
    profile_colour: string | null // #fa3703
    username: string
  }
}
