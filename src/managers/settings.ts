import { SettingsAndOptions, CombatSettings, SiteSettings, Setting, Mode, CountryName } from "types"
import { speedValues } from "data"

export const changeCombatParameter = (settings: SettingsAndOptions, mode: Mode, key: keyof CombatSettings, value: number | boolean | string) => {
  settings.combatSettings[mode][key] = value as never
}

export const changeSiteParameter = (settings: SettingsAndOptions, key: keyof SiteSettings, value: number | boolean | string) => {
  if (key === Setting.Performance && typeof value === 'string' && speedValues[value]) {
    settings.siteSettings[Setting.PhasesPerRoll] = speedValues[value][0]
    settings.siteSettings[Setting.MaxPhases] = speedValues[value][1]
    settings.siteSettings[Setting.ReduceRolls] = speedValues[value][2]
  }
  settings.siteSettings[key] = value as never
}

export const setMode = (settings: SettingsAndOptions, mode: Mode) => {
  settings.mode = mode
  settings.army = 0
}

export const selectCountry = (settings: SettingsAndOptions, countryName: CountryName) => {
  settings.country = countryName
  settings.army = 0
}

export const selectArmy = (settings: SettingsAndOptions, army: number) => {
  settings.army = army
}

