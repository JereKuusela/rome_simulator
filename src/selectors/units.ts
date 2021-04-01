import { convertUnitDefinitions, filterUnitDefinitions } from 'army_utils'
import { applyUnitModifiers } from 'managers/units'
import createCachedSelector from 're-reselect'
import { AppState } from 'state'
import { getGeneralData, getGeneralModifiers } from './armies'
import { getCountryModifiers } from './countries'
import { getCombatSettings } from './settings'
import { getMode } from './ui'
import { ArmyKey, getArmyKey } from './utils'

const getUnits = (state: AppState, key: ArmyKey) => state.countries[key.countryName].units

const getCountryModifiersWithKey = (state: AppState, key: ArmyKey) => getCountryModifiers(state, key.countryName)

const getSubDefinitions = createCachedSelector(
  [getUnits, getCountryModifiersWithKey, getGeneralModifiers],
  (units, countryModifiers, generalModifiers) => {
    return applyUnitModifiers(units, countryModifiers.concat(generalModifiers))
  }
)(getArmyKey)

export const getUnitDefinitions = createCachedSelector(
  [getMode, getGeneralData, getCombatSettings, getSubDefinitions],
  (mode, generalData, settings, subDefinitions) => {
    const general = generalData.definitions
    const units = convertUnitDefinitions(settings, subDefinitions, general)
    return filterUnitDefinitions(mode, units)
  }
)(getArmyKey)
