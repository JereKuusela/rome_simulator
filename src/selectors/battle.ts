import * as manager from 'managers/battle'
import { createSelector } from 'reselect'
import { AppState } from 'state'
import { Mode, SideType } from 'types'
import { getTerrainsData } from './terrains'
import { getMode } from './ui'
import { useSelector } from './utils'

export const getBattle = (state: AppState, mode?: Mode) => state.battle[mode ?? getMode(state)]
export const getTimestamp = (state: AppState, mode?: Mode) => getBattle(state, mode).timestamp
export const getSide = (state: AppState, sideType: SideType, mode?: Mode) => getBattle(state, mode).sides[sideType]
export const getParticipants = (state: AppState, sideType: SideType, mode?: Mode) =>
  getBattle(state, mode).sides[sideType].participants
export const getRound = (state: AppState) => manager.getDay(getBattle(state))
export const getOutdated = (state: AppState) => getBattle(state).outdated
export const getCombatSide = (state: AppState, sideType: SideType) => {
  const side = getSide(state, sideType)
  return side.days[side.days.length - 1]
}
export const getSelectedTerrainTypes = (state: AppState) => getBattle(state).terrains

export const getSelectedTerrains = createSelector([getSelectedTerrainTypes, getTerrainsData], (selected, terrains) =>
  selected.map(item => terrains[item])
)

export const useTimestamp = () => useSelector(getTimestamp)
export const useBattle = () => useSelector(getBattle)
export const useSide = (sideType: SideType, mode?: Mode) => useSelector(state => getSide(state, sideType, mode))
export const useParticipants = (sideType: SideType, mode?: Mode) =>
  useSelector(state => getParticipants(state, sideType, mode))
export const useRound = () => useSelector(getRound)
export const useOutdated = () => useSelector(getOutdated)
export const useCombatSide = (sideType: SideType) => useSelector(state => getCombatSide(state, sideType))
export const useSelectedTerrains = () => useSelector(getSelectedTerrains)
