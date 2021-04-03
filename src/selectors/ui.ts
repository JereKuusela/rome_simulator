import type { AppState } from 'reducers'
import { SideType } from 'types'
import { keys } from 'utils'
import { getArmies, getCountries } from './countries'
import { useSelector } from './utils'

export const getSelectedParticipantIndex = (state: AppState, sideType: SideType) =>
  state.ui.selectedParticipantIndex[sideType]
export const getMode = (state: AppState) => state.ui.mode
export const getSelectedArmyIndex = (state: AppState) => state.ui.selectedArmyIndex
export const getSelectedCountryIndex = (state: AppState) => state.ui.selectedCountryIndex

// No need to cache these because strings are returned and not used for combat calculations.
export const getSelectedCountry = (state: AppState) => keys(getCountries(state))[getSelectedCountryIndex(state)]
export const getSelectedArmy = (state: AppState) =>
  keys(getArmies(state, getSelectedCountry(state)))[getSelectedArmyIndex(state)]

export const useMode = () => useSelector(getMode)
export const useSelectedParticipantIndex = (sideType: SideType) =>
  useSelector(state => getSelectedParticipantIndex(state, sideType))
export const useSelectedArmyIndex = () => useSelector(getSelectedArmyIndex)
export const useSelectedCountryIndex = () => useSelector(getSelectedCountryIndex)
export const useSelectedCountry = () => useSelector(getSelectedCountry)
