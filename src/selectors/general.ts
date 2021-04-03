import { applyGeneralModifiers, convertGeneralDefinition } from 'managers/army'
import * as manager from 'managers/modifiers'
import createCachedSelector from 're-reselect'
import type { AppState } from 'reducers'
import { CountryName, ArmyName, GeneralDefinition } from 'types'
import { getCountryData } from './countries'
import { getCombatSettings } from './settings'
import { getTacticsData } from './tactics'
import { ArmyKey, getArmyKey, useSelector } from './utils'

const getGeneral = (state: AppState, key: ArmyKey) =>
  getCountryData(state, key.countryName).armies[key.armyName].general

export const getGeneralModifiers = createCachedSelector([getGeneral], manager.getGeneralModifiers)(getArmyKey)

export const getGeneralData = createCachedSelector([getGeneral, getGeneralModifiers], applyGeneralModifiers)(getArmyKey)

export const getGeneralDefinition = createCachedSelector(
  [getCombatSettings, getGeneralData, getTacticsData],
  convertGeneralDefinition
)(getArmyKey)

export const useGeneral = (countryName: CountryName, armyName: ArmyName): GeneralDefinition => {
  const key = { countryName, armyName }
  return useSelector(state => getGeneralDefinition(state, key))
}
