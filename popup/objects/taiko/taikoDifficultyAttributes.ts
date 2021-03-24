import Skill from '../../skills/skill'
import TaikoDifficultyHitObject from './taikoDifficultyHitObject'

export default class TaikoDifficultyAttributes {
  public starRating: number
  public mods: number
  public staminaStrain: number
  public rhythmStrain: number
  public colourStrain: number
  public greatHitWindow: number
  public maxCombo: number
  public skills: Array<Skill<TaikoDifficultyHitObject>>

  constructor(
    starRating: number,
    mods: number,
    staminaStrain: number,
    rhythmStrain: number,
    colourStrain: number,
    greatHitWindow: number,
    maxCombo: number,
    skills: Array<Skill<TaikoDifficultyHitObject>>
  ) {
    this.starRating = starRating
    this.mods = mods
    this.staminaStrain = staminaStrain
    this.rhythmStrain = rhythmStrain
    this.colourStrain = colourStrain
    this.greatHitWindow = greatHitWindow
    this.maxCombo = maxCombo
    this.skills = skills
  }
}
