import { calculateValue } from 'data_values'
import { sumBy } from 'lodash'
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import { AppState } from 'state'
import { CombatSettings, CountryAttribute, Setting, SideType, TerrainCalc } from 'types'
import { getParticipants, getSelectedTerrains } from './battle'
import { getCountry } from './countries'
import { getMode } from './ui'

const getSharedSettings = (state: AppState) => state.settings.sharedSettings
const getModeSettings = (state: AppState) => state.settings.modeSettings[getMode(state)]

// Todo: This should be cached.
const getCombatWidth = (state: AppState) => {
  const settings = getSharedSettings(state)
  const attackers = getParticipants(state, SideType.A).map(
    item => getCountry(state, item.countryName)[CountryAttribute.CombatWidth]
  )
  const defenders = getParticipants(state, SideType.B).map(
    item => getCountry(state, item.countryName)[CountryAttribute.CombatWidth]
  )
  const terrains = sumBy(getSelectedTerrains(state), terrain => calculateValue(terrain, TerrainCalc.CombatWidth))
  return settings[Setting.BaseCombatWidth] + terrains + Math.max(...attackers, ...defenders)
}

export const getCombatSettings = createSelector(
  [getSharedSettings, getModeSettings, getCombatWidth],
  (shared, mode, combatWidth) => {
    const settings = { ...shared, ...mode } as CombatSettings
    settings[Setting.BaseCombatWidth] = combatWidth
    settings[Setting.Precision] = Math.pow(10, settings[Setting.Precision])
    return settings
  }
)

export const useCombatSettings = () => useSelector(getCombatSettings)
