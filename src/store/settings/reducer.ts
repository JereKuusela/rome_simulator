import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'
import { Setting, SimulationSpeed, SiteSettings, CombatSettings } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings, getDefaultSiteSettings } from './data'
import { CountryName, createCountry, deleteCountry, changeCountryName } from '../countries'
import { DefinitionType, Mode } from '../../base_definition'
import { ObjSet, has } from '../../utils'
import { Side } from '../battle'
import { UnitCalc } from '../units'
import { WearinessValues } from '../../components/WearinessRange'

export const getDefaultSettings = () => ({
  combatSettings: { [DefinitionType.Land]: getDefaultLandSettings(), [DefinitionType.Naval]: getDefaultNavalSettings() },
  siteSettings: getDefaultSiteSettings(),
  simple_mode: true,
  mode: DefinitionType.Land as Mode,
  country: CountryName.Country1,
  accordions: {} as ObjSet,
  weariness: {
    [Side.Attacker]: { [UnitCalc.Morale]: { min: 0, max: 0 }, [UnitCalc.Strength]: { min: 0, max: 0 } },
    [Side.Defender]: { [UnitCalc.Morale]: { min: 0, max: 0 }, [UnitCalc.Strength]: { min: 0, max: 0 } }
  } as WearinessValues
})

const settings = getDefaultSettings()

const speedValues: { [key: string]: number[] } = {
  [SimulationSpeed.VeryAccurate]: [1.0, 5],
  [SimulationSpeed.Accurate]: [1.0, 4],
  [SimulationSpeed.Normal]: [1.5, 4],
  [SimulationSpeed.Fast]: [2.0, 4],
  [SimulationSpeed.VeryFast]: [3.0, 3]
}

class SettingsReducer extends ImmerReducer<typeof settings> {

  changeCombatParameter(mode: Mode, key: keyof CombatSettings, value: number | boolean | string) {
    this.draftState.combatSettings[mode][key] = value as never
  }

  changeSiteParameter(key: keyof SiteSettings, value: number | boolean | string) {
    if (key === Setting.Performance && typeof value === 'string' && speedValues[value]) {
      this.draftState.siteSettings[Setting.PhaseLengthMultiplier] = speedValues[value][0]
      this.draftState.siteSettings[Setting.MaxDepth] = speedValues[value][1]
    }
    if (key === Setting.PhaseLengthMultiplier || key === Setting.MaxDepth) {
      this.draftState.siteSettings[Setting.Performance] = SimulationSpeed.Custom
    }
    this.draftState.siteSettings[key] = value as never
  }

  toggleSimpleMode() {
    this.draftState.simple_mode = !this.state.simple_mode
  }

  toggleMode() {
    this.draftState.mode = this.state.mode === DefinitionType.Land ? DefinitionType.Naval : DefinitionType.Land
  }

  selectCountry(country: CountryName) {
    this.draftState.country = country
  }

  changeCountryName(old_country: CountryName, country: CountryName) {
    if (this.state.country === old_country)
      this.selectCountry(country)
  }

  createCountry(country: CountryName) {
    this.selectCountry(country)
  }

  deleteCountry(country: CountryName) {
    if (this.state.country === country)
      this.selectCountry('' as CountryName)
  }

  toggleAccordion(key: string) {
    if (has(this.state.accordions, key))
      delete this.draftState.accordions[key]
    else
      this.draftState.accordions[key] = true
  }

  changeWeariness(side: Side, type: UnitCalc, min: number, max: number) {
    this.draftState.weariness[side][type].min = min
    this.draftState.weariness[side][type].max = max
  }
}

const actions = createActionCreators(SettingsReducer)

export const changeCombatParameter = actions.changeCombatParameter
export const changeSiteParameter = actions.changeSiteParameter
export const selectCountry = actions.selectCountry
export const toggleAccordion = actions.toggleAccordion
export const toggleMode = actions.toggleMode
export const toggleSimpleMode = actions.toggleSimpleMode
export const changeWeariness = actions.changeWeariness

export const reducer = createReducerFunction(SettingsReducer, settings)

export const settingsReducer = (state = settings, action: Actions<typeof SettingsReducer>) => {
  if (action.type === createCountry.type)
    return reducer(state, { payload: action.payload, type: actions.createCountry.type, args: true } as any)
  if (action.type === deleteCountry.type)
    return reducer(state, { payload: action.payload, type: actions.deleteCountry.type })
  if (action.type === changeCountryName.type)
    return reducer(state, { payload: action.payload, type: actions.changeCountryName.type, args: true } as any)
  return reducer(state, action)
}
