import * as manager from 'managers/battle'
import { getAttacker } from 'managers/battle'
import { createSelector } from 'reselect'
import type { AppState } from 'reducers'
import { Environment, Mode, SideType } from 'types'
import { getCombatSettings } from './settings'
import { getTerrainsData } from './terrains'
import { getMode } from './ui'
import { useSelector } from './utils'

export const getBattle = (state: AppState, mode?: Mode) => state.battle[mode ?? getMode(state)]
export const getTimestamp = (state: AppState, mode?: Mode) => getBattle(state, mode).timestamp
export const getSideData = (state: AppState, sideType: SideType, mode?: Mode) => getBattle(state, mode).sides[sideType]
export const getParticipants = (state: AppState, sideType: SideType, mode?: Mode) =>
  getBattle(state, mode).sides[sideType].participants
export const getRound = (state: AppState) => manager.getDay(getBattle(state))
export const getOutdated = (state: AppState) => getBattle(state).outdated
export const getSide = (state: AppState, sideType: SideType) => {
  const side = getSideData(state, sideType)
  return side.days[side.days.length - 1]
}

export const getCombatEnvironment = (state: AppState): Environment => {
  const battle = getBattle(state)
  const terrains = battle.terrains.map(value => state.terrains[value])
  const settings = getCombatSettings(state)
  return {
    day: 0,
    round: getRound(state),
    terrains,
    settings,
    attacker: getAttacker(battle),
    mode: getMode(state)
  }
}

export const getSelectedTerrainTypes = (state: AppState) => getBattle(state).terrains

export const getSelectedTerrains = createSelector([getSelectedTerrainTypes, getTerrainsData], (selected, terrains) =>
  selected.map(item => terrains[item])
)

export const getCohorts = (state: AppState, sideType: SideType) => getSide(state, sideType).cohorts

export const useTimestamp = () => useSelector(getTimestamp)
export const useBattle = () => useSelector(getBattle)
export const useSide = (sideType: SideType, mode?: Mode) => useSelector(state => getSideData(state, sideType, mode))
export const useParticipants = (sideType: SideType, mode?: Mode) =>
  useSelector(state => getParticipants(state, sideType, mode))
export const useRound = () => useSelector(getRound)
export const useOutdated = () => useSelector(getOutdated)
export const useCombatSide = (sideType: SideType) => useSelector(state => getSide(state, sideType))
export const useSelectedTerrains = () => useSelector(getSelectedTerrains)
export const useCohorts = (sideType: SideType) => useSelector(state => getCohorts(state, sideType))
