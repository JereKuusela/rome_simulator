import { applyGeneralModifiers, convertGeneralDefinition } from 'managers/army'
import * as manager from 'managers/modifiers'
import * as battleManager from 'managers/battle'
import createCachedSelector from 're-reselect'
import { AppState } from 'state'
import { ArmyName, CountryName, GeneralDefinition, Mode, Participant, SideType } from 'types'
import { getArmyKey, ArmyKey, useSelector } from './utils'
import { getParticipantName } from 'managers/battle'
import { getArmies, getCountryData } from './countries'
import { getCombatSettings } from './settings'
import { getTacticsData } from './tactics'
import { getCombatSide, getSide } from './battle'

const getArmyData = (state: AppState, countryName: CountryName, armyName: ArmyName) =>
  getArmies(state, countryName)[armyName]

const getUnitPreferences = (state: AppState, countryName: CountryName, armyName: ArmyName) =>
  getArmyData(state, countryName, armyName).unitPreferences

const getGeneral = (state: AppState, key: ArmyKey) =>
  getCountryData(state, key.countryName).armies[key.armyName].general

export const getGeneralModifiers = createCachedSelector([getGeneral], general => {
  return manager.getGeneralModifiers(general)
})(getArmyKey)

export const getGeneralData = createCachedSelector([getGeneral, getGeneralModifiers], (general, modifiers) => {
  return applyGeneralModifiers(general, modifiers)
})(getArmyKey)

export const getGeneralDefinition = createCachedSelector(
  [getCombatSettings, getGeneralData, getTacticsData],
  (settings, general, tactics) => convertGeneralDefinition(settings, general, tactics)
)(getArmyKey)

export const getParticipant = (state: AppState, type: SideType, index: number, mode?: Mode): Participant =>
  getSide(state, type, mode).participants[index]

export const getLeadingArmy = (state: AppState, sideType: SideType) => {
  const side = getCombatSide(state, sideType)
  return battleManager.getLeadingArmy(side)
}

export const useParticipant = (type: SideType, index: number, mode?: Mode) =>
  useSelector(state => getParticipant(state, type, index, mode))

export const useParticipantName = (type: SideType, index: number, mode?: Mode) =>
  useSelector(state => getParticipantName(getParticipant(state, type, index, mode)))

export const useGeneral = (countryName: CountryName, armyName: ArmyName): GeneralDefinition => {
  const key = { countryName, armyName }
  return useSelector(state => getGeneralDefinition(state, key))
}

export const useLeadingArmy = (sideType: SideType) => useSelector(state => getLeadingArmy(state, sideType))

export const useArmyData = (countryName: CountryName, armyName: ArmyName) =>
  useSelector(state => getArmyData(state, countryName, armyName))

export const useUnitPrefences = (countryName: CountryName, armyName: ArmyName) =>
  useSelector(state => getUnitPreferences(state, countryName, armyName))
