import { SettingsAndOptions, Mode, CombatSettings, SiteSettings, Setting, SimulationSpeed, DefinitionType, CountryName, Side, WearinessAttribute } from "types"
import { speedValues } from "data"
import { has } from "utils"

export const changeCombatParameter = (settings: SettingsAndOptions, mode: Mode, key: keyof CombatSettings, value: number | boolean | string) => {
  settings.combatSettings[mode][key] = value as never
}

export const changeSiteParameter = (settings: SettingsAndOptions, key: keyof SiteSettings, value: number | boolean | string) => {
  if (key === Setting.Performance && typeof value === 'string' && speedValues[value]) {
    settings.siteSettings[Setting.PhaseLengthMultiplier] = speedValues[value][0]
    settings.siteSettings[Setting.MaxDepth] = speedValues[value][1]
  }
  if (key === Setting.PhaseLengthMultiplier || key === Setting.MaxDepth) {
    settings.siteSettings[Setting.Performance] = SimulationSpeed.Custom
  }
  settings.siteSettings[key] = value as never
}

export const toggleMode = (settings: SettingsAndOptions) => {
  settings.mode = settings.mode === DefinitionType.Land ? DefinitionType.Naval : DefinitionType.Land
}

export const selectCountry = (settings: SettingsAndOptions, country: CountryName) => {
  settings.country = country
}

export const toggleAccordion = (settings: SettingsAndOptions, key: string) => {
  if (has(settings.accordions, key))
    delete settings.accordions[key]
  else
    settings.accordions[key] = true
}

export const changeWeariness = (settings: SettingsAndOptions, side: Side, type: WearinessAttribute, min: number, max: number) => {
  settings.weariness[side][type].min = min
  settings.weariness[side][type].max = max
}
