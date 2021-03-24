import { modbits } from 'ojsama'
import Skill from '../../skills/skill'

export default class TaikoDifficultyAttributes {
  /**
   * @param {number} starRating
   * @param {modbits} mods
   * @param {number} staminaStrain
   * @param {number} rhythmStrain
   * @param {number} colourStrain
   * @param {number} greatHitWindow
   * @param {number} maxCombo
   * @param {Skill[]} skills
   */
  constructor(
    starRating,
    mods,
    staminaStrain,
    rhythmStrain,
    colourStrain,
    greatHitWindow,
    maxCombo,
    skills
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
