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
