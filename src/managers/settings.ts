import { Settings, CombatModeSettings, CombatSharedSettings, Setting, Mode } from 'types'
import { speedValues } from 'data'

export const changeCombatParameter = (
  settings: Settings,
  mode: Mode,
  key: keyof CombatModeSettings,
  value: number | boolean | string
) => {
  settings.modeSettings[mode][key] = value as never
}

export const changeSiteParameter = (
  settings: Settings,
  key: keyof CombatSharedSettings,
  value: number | boolean | string
) => {
  if (key === Setting.Performance && typeof value === 'string' && speedValues[value]) {
    settings.sharedSettings[Setting.PhasesPerRoll] = speedValues[value][0]
    settings.sharedSettings[Setting.MaxPhases] = speedValues[value][1]
    settings.sharedSettings[Setting.ReduceRolls] = speedValues[value][2]
  }
  settings.sharedSettings[key] = value as never
}
