import { SettingsAndOptions, CombatSettings, SiteSettings, Setting, SimulationSpeed, Mode, CountryName } from "types"
import { speedValues } from "data"

export const changeCombatParameter = (settings: SettingsAndOptions, mode: Mode, key: keyof CombatSettings, value: number | boolean | string) => {
  settings.combatSettings[mode][key] = value as never
}

export const changeSiteParameter = (settings: SettingsAndOptions, key: keyof SiteSettings, value: number | boolean | string) => {
  if (key === Setting.Performance && typeof value === 'string' && speedValues[value]) {
    settings.siteSettings[Setting.PhaseLengthMultiplier] = speedValues[value][0]
    settings.siteSettings[Setting.MaxDepth] = speedValues[value][1]
    settings.siteSettings[Setting.ReduceRolls] = speedValues[value][2]
  }
  if (key === Setting.PhaseLengthMultiplier || key === Setting.MaxDepth) {
    settings.siteSettings[Setting.Performance] = SimulationSpeed.Custom
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

