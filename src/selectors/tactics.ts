import { getOpponent } from 'army_utils'
import { convertTactic, filterTactics } from 'managers/tactics'
import { AppState, getCohorts } from 'state'
import { SideType } from 'types'
import { toArr } from 'utils'
import { getLeadingArmy } from './armies'
import { getMode } from './ui'
import { useSelector } from './utils'

export const getTacticsData = (state: AppState) => state.tactics

const getTactics = (state: AppState, side: SideType) => {
  const cohorts = getCohorts(state, side)
  const opponent = getLeadingArmy(state, getOpponent(side))
  const mode = getMode(state)
  const tactics = toArr(filterTactics(getTacticsData(state), mode))
  return opponent ? tactics.map(tactic => convertTactic(tactic, cohorts, opponent.tactic)) : []
}

export const useTactics = (side: SideType) => useSelector(state => getTactics(state, side))

export const useTactic = (side: SideType) => useSelector(state => getTactics(state, side))
