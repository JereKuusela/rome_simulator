import { ImmerReducer, createActionCreators, createReducerFunction, Actions } from 'immer-reducer'
import { CombatParameter, SimulationParameter } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings, getDefaultSimulationSettings } from './data'
import { CountryName, createCountry, deleteCountry, changeCountryName } from '../countries'
import { DefinitionType, Mode } from '../../base_definition'
import { ObjSet, has } from '../../utils'
import { Side } from '../battle'
import { UnitCalc } from '../units'
import { WearinessValues } from '../../components/WearinessRange'

export const getDefaultSettings = () => ({
  combat: { [DefinitionType.Land]: getDefaultLandSettings(), [DefinitionType.Naval]: getDefaultNavalSettings() },
  simulation: getDefaultSimulationSettings(),
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

class SettingsReducer extends ImmerReducer<typeof settings> {

  changeCombatParameter(mode: Mode, key: CombatParameter, value: number) {
    this.draftState.combat[mode][key] = value
  }

  changeSimulationParameter(key: SimulationParameter, value: number) {
    this.draftState.simulation[key] = value
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
export const changeSimulationParameter = actions.changeSimulationParameter
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
